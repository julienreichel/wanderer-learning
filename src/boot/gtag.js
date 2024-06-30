import { boot } from "quasar/wrappers";
import VueGtag from "vue-gtag";

export default boot(({ app, router }) => {
  app.use(
    VueGtag,
    {
      appName: "Wanderer Learning",
      pageTrackerScreenviewEnabled: true,
      config: {
        id: "G-ERVSFC125L",
      },
    },
    router,
  );
});
