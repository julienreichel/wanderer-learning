import { boot } from "quasar/wrappers";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

import AmplifyVue from "@aws-amplify/ui-vue";

import {
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { ref } from "vue";

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.API,
  },
});

export default boot(({ app, router }) => {
  app.use(AmplifyVue);

  let userIdSet = false;
  const userAttributesRef = ref({});
  app.provide("userAttributes", userAttributesRef);
  router.beforeEach(async (to, from, next) => {
    if (to.meta.publicPage || to.path === "/login/") {
      if (userAttributesRef.value.userId) {
        userAttributesRef.value = {};
      }
      return next();
    }
    try {
      const currentUser = await getCurrentUser();
      if (!userIdSet) {
        try {
          const authSession = await fetchAuthSession();
          const authToken = authSession.tokens?.idToken;
          let { identities, ...userAttributes } = await fetchUserAttributes();
          console.log(currentUser, authSession, identities, userAttributes);
          const groups =
            authSession.tokens.accessToken.payload["cognito:groups"];
          const isAdmin = groups && groups.includes("admin");
          const isTeacher = groups && groups.includes("teacher");
          const { identityId } = authSession;
          const { userId, username } = currentUser;

          userAttributes.name = userAttributes.name || userAttributes.email;
          userAttributesRef.value = {
            ...userAttributes,
            groups,
            identityId,
            userId,
            username,
            isAdmin,
            isTeacher,
          };

          const existingConfig = Amplify.getConfig();
          Amplify.configure(existingConfig, {
            API: {
              REST: {
                headers: async () => {
                  return { Authorization: authToken };
                },
              },
            },
          });

          userIdSet = true;
        } catch (err) {
          console.log(err);
        }
      }
      return next();
    } catch (err) {
      console.log(err);
      userAttributesRef.value = {};
      return next({
        path: "/login",
      });
    }
  });
});
