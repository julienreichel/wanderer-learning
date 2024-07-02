<template>
  <amplify-uploader
    ref="uploaderRef"
    :accept="accept"
    :filename="
      (file) => prefix + '/' + uid() + '.' + file.name.split('.').pop()
    "
    @uploaded="uploaded"
    @start="start"
    @finish="finish"
    @added="addFile"
    :multiple="multiple"
    :flat="flat"
    :bordered="bordered"
    :square="square"
    :dark="dark"
    :color="color"
  >
    <template v-slot:header="scope">
      <div class="row no-wrap items-center q-pa-xs q-gutter-none">
        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
        <q-btn
          v-if="scope.canAddFiles"
          type="a"
          icon="add_box"
          @click="scope.pickFiles"
          round
          dense
          flat
          size="sm"
        >
          <q-uploader-add-trigger />
        </q-btn>
        <div class="q-ml-xs q-mr-xs">{{ title }}</div>
        <q-btn
          v-if="scope.canUpload"
          icon="cloud_upload"
          @click="scope.upload"
          round
          dense
          flat
        >
        </q-btn>
      </div>
    </template>
  </amplify-uploader>
</template>

<script setup>
import mime from "mime-types";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

import AmplifyUploader from "../utils/AmplifyUploader.js";

import { ref } from "vue";

import { useIris } from "src/composables/iris";
const { uid } = useIris();

const props = defineProps({
  multiple: { type: Boolean, default: false },
  title: { type: String },
  flat: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  square: { type: Boolean, default: false },
  dark: { type: Boolean, default: false },
  color: { type: String, default: "primary" },
  accept: { type: String, default: ".jpg, image/*" },
  prefix: { type: String, default: "global" },
  convertPdfToImages: {
      type: Boolean,
      default: false,
  },
});
const emit = defineEmits(["uploaded"]);

async function convertPdf(pdfFile) {
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
    file.description = textContent.items
      .filter((item) => item.str.trim().length > 1)
      .map((item) => item.str)
      .join("\n");
    images.push(file);
  }

  return images;
}

const uploaderRef = ref(null);
let uploadedFiles = [];
let idx = 0;
const addFile = async (files) => {
  for (const file of files) {
    if (props.convertPdfToImages && mime.lookup(file.name) === "application/pdf") {
      try {
        const images = await convertPdf(file);
        uploaderRef.value.addFiles(images);
        uploaderRef.value.removeFile(file);
      } catch (error) {
        console.error("Failed to convert PDF to images", error);
      }
    } else {
      file.idx = idx++;
    }
  }
};
const uploaded = async (msg) => {
  const files = msg.files;
  files.forEach((file) => {
    uploadedFiles[file.idx] = file;
  });

  const uploader = uploaderRef.value;
  if (uploader) {
    uploader.removeUploadedFiles();
  }
};
const start = async (msg) => {
  uploadedFiles = [];
};
const finish = async (msg) => {
  uploadedFiles = uploadedFiles.filter((file) => Boolean(file));

  emit("uploaded", uploadedFiles);
};

const convertPDFFilter = async (files) => {
  let finalFiles = [];
  for (const file of files) {
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
  return files;
};
</script>

<style lang="scss">
.q-uploader__list {
  padding: 0px;
}
</style>
