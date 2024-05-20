import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "wandererLearningStorage",
  access: (allow) => ({
    "public/*": [
      allow.guest.to(["read", "write"]),
      allow.authenticated.to(["read", "write", "delete"]),
      allow
        .groups(["admin", "teacher", "student"])
        .to(["read", "write", "delete"]),
    ],
    "protected/*": [
      allow.authenticated.to(["read"]),
      allow.groups(["student"]).to(["read"]),
      allow.groups(["admin", "teacher"]).to(["read", "write", "delete"]),
    ],
  }),
});
