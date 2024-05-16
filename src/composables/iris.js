import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar, uid } from 'quasar';
import { inject } from 'vue';

export function useIris() {
  const router = useRouter();
  const { t } = useI18n();
  const $q = useQuasar();


  const userAttributes = inject('userAttributes');
  const { userId, isAdmin } = userAttributes.value;

  const canEdit = (item) => {
    return isAdmin || item?.owner === userId
  }

  return { router, t, $q, uid, canEdit }
}
