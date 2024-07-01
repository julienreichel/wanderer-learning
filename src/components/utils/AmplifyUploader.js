import { createUploaderComponent } from "quasar";
import { ref, computed } from "vue";
import mime from "mime-types";
import { getUrl, uploadData } from "aws-amplify/storage";
//import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker';
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
//window.pdfjsWorker = pdfjsWorker;

export default createUploaderComponent({
  name: "AmplifyUploader", // your component's name

  props: {
    filename: {
      type: [Function, String],
      default: () => {
        return (file) => file.name;
      },
    },
    folder: {
      type: [Function, String],
      default: "protected",
    },
    contentType: {
      type: [Function, String],
      default: () => {
        return (file) => mime.contentType(file.name);
      },
    },
    metadata: {
      type: [Function, Object],
      default: {},
    },
    batch: [Function, Boolean],
    convertPdfToImages: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["factoryFailed", "uploaded", "failed", "uploading"],

  injectPlugin({ props, emit, helpers }) {
    function getFn(prop) {
      return typeof prop === "function" ? prop : () => prop;
    }

    const storages = ref([]);
    const promises = ref([]);
    const workingThreads = ref(0);

    const storageProps = computed(() => ({
      filename: getFn(props.filename),
      folder: getFn(props.folder),
      contentType: getFn(props.contentType),
      metadata: getFn(props.metadata),

      batch: getFn(props.batch),
      factory: Function,
    }));

    const isUploading = computed(() => workingThreads.value > 0);
    const isBusy = computed(() => promises.value.length !== 0);

    let abortPromises;

    function abort() {
      storages.value.forEach((s) => {
        s.cancel();
      });

      if (promises.value.length !== 0) {
        abortPromises = true;
      }
    }

    // Start the uploading process
    async function upload() {
      const queue = helpers.queuedFiles.value.slice(0);
      helpers.queuedFiles.value = [];
      let finalQueue = [];

      // Convert PDFs to images if the option is enabled
      if (props.convertPdfToImages) {
        for (const file of queue) {
          if (mime.lookup(file.name) === "application/pdf") {
            try {
              const files = await convertPdfToImages(file);
              finalQueue.push(...files);
              emit("added", files);
            } catch (error) {
              console.error("Failed to convert PDF to images", error);
              helpers.updateFileStatus(file, "failed");
            }
          } else {
            finalQueue.push(file);
          }
        }
      } else {
        finalQueue = queue;
      }

      if (storageProps.value.batch(finalQueue)) {
        runFactory(finalQueue);
      } else {
        finalQueue.forEach((file) => {
          runFactory([file]);
        });
      }
    }

    function runFactory(files) {
      workingThreads.value++;

      if (typeof props.factory !== "function") {
        performUpload(files, {});
        return;
      }

      const res = props.factory(files);

      if (!res) {
        emit(
          "factoryFailed",
          new Error("QAmplifyUploader: factory() does not return properly"),
          files,
        );
        workingThreads.value--;
      } else if (
        typeof res.catch === "function" &&
        typeof res.then === "function"
      ) {
        promises.value.push(res);

        const failed = (err) => {
          if (helpers.isAlive() === true) {
            promises.value = promises.value.filter((p) => p !== res);

            if (promises.value.length === 0) {
              abortPromises = false;
            }

            helpers.queuedFiles.value = helpers.queuedFiles.value.concat(files);
            files.forEach((f) => {
              helpers.updateFileStatus(f, "failed");
            });

            emit("factoryFailed", err, files);
            workingThreads.value--;
          }
        };

        res
          .then((factory) => {
            if (abortPromises === true) {
              failed(new Error("Aborted"));
            } else if (helpers.isAlive() === true) {
              promises.value = promises.value.filter((p) => p !== res);
              performUpload(files, factory);
            }
          })
          .catch(failed);
      } else {
        performUpload(files, res || {});
      }
    }

    async function performUpload(files, factory) {
      const getProp = (name, arg) => {
        return factory[name] !== void 0
          ? getFn(factory[name])(arg)
          : storageProps.value[name](arg);
      };

      emit("uploading", { files });
      for (const file of files) {
        await uploadSingleFile(file, getProp);
      }
      emit("uploaded", { files });

      workingThreads.value--;
    }

    async function uploadSingleFile(file, getProp) {
      const filename = getProp("filename", file);
      if (!filename) {
        console.error("amplify-uploader: invalid or no URL specified");
        workingThreads.value--;
        return;
      }
      const folder = getProp("folder", file);
      const contentType = getProp("contentType", file);
      const metadata = getProp("metadata", file);

      try {
        const storage = uploadData({
          path: `${folder}/${filename}`,
          data: file,
          options: {
            contentType,
            metadata,
          },
          onProgress: ({ transferredBytes }) => {
            helpers.uploadedSize.value += transferredBytes;
            helpers.updateFileStatus(file, "uploading", transferredBytes);
          },
        });

        storages.value.push(storage);
        helpers.updateFileStatus(file, "uploading", 0);

        const result = await storage.result;
        console.log("amplify-uploader: succeeded: ", result);

        file.path = result.path;
        const getUrlResult = await getUrl({
          path: result.path,
          options: {},
        });
        file.url = getUrlResult.url.toString();

        helpers.uploadedFiles.value.push(file);
        helpers.updateFileStatus(file, "uploaded");

        storages.value = storages.value.filter((s) => s !== storage);
      } catch (error) {
        console.log("amplify-uploader: error : ", error);
        helpers.updateFileStatus(file, "failed");
      }
    }

    async function convertPdfToImages(pdfFile) {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfFile)).promise;
      const numPages = pdf.numPages;
      const images = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageBlob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });


        let title = `${pdfFile.name}-page-${pageNum}.png`;

        let file = new File([imageBlob], title, { type: "image/png" });

        // Extract the text content from the page
        const textContent = await page.getTextContent();
        file.description = textContent.items.filter(item => item.str.trim().length > 1).map(item => item.str).join('\n');
        images.push(file);
      }

      return images;
    }

    return {
      isUploading,
      isBusy,

      abort,
      upload,
    };
  },
});
