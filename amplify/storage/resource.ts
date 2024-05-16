import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "wandererLearningStorage",
  access: (allow) => ({
    "public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
    "profile-pictures/{entity_id}/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.groups(["admin"]).to(["delete"]),
    ],
    "protected/{entity_id}/*": [
      allow.authenticated.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.groups(["admin"]).to(["read", "write", "delete"]),
    ],
  }),
});
