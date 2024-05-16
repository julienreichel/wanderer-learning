const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'Home', path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },

  {
    path: '/login',
    component: () => import('layouts/AnonymousUserLayout.vue'),
    children: [{
      name: 'SignIn',
      path: '',
      component: () => import('src/pages/LoginPage.vue'),
      meta: {
        publicPage: true
      }
    }],
  },

  {
    path: '/course',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'CourseList',
        path: '',
        component: () => import('src/pages/course/CourseListPage.vue')
      }, {
        name: 'CourseEdit',
        path: 'edit/:id',
        component: () => import('src/pages/course/CourseEditPage.vue'),
        props: true
      }, {
        name: 'CourseView',
        path: 'view/:id',
        component: () => import('src/pages/course/CourseViewPage.vue'),
        props: true
      },
      {
        path: 'lecture',
        children: [
          {
            name: 'LectureEdit',
            path: 'edit/:id',
            component: () => import('src/pages/lecture/LectureEditPage.vue'),
            props: true
          }, {
            name: 'LectureView',
            path: 'view/:id',
            component: () => import('src/pages/lecture/LectureViewPage.vue'),
            props: true
          },
          {
            path: 'step',
            children: [
              {
                name: 'LectureStepEdit',
                path: 'edit/:id',
                component: () => import('src/pages/lecture/LectureStepEditPage.vue'),
                props: true
              }, {
                name: 'LectureStepView',
                path: 'view/:id/:stepIdx',
                component: () => import('src/pages/lecture/LectureStepViewPage.vue'),
                props: true
              }],
          },
          {
            path: 'quiz',
            children: [
              {
                name: 'QuizEdit',
                path: 'edit/:id',
                component: () => import('src/pages/quiz/QuizEditPage.vue'),
                props: true
              }, {
                name: 'QuizView',
                path: 'view/:id/:stepIdx',
                component: () => import('src/pages/lecture/LectureStepViewPage.vue'),
                props: true
              }],
          },
        ]
      },
    ],
  },


  {
    path: '/concept',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'ConceptList',
        path: '',
        component: () => import('src/pages/concept/ConceptListPage.vue')
      }, {
        name: 'ConceptView',
        path: 'view/:id',
        component: () => import('src/pages/concept/ConceptViewPage.vue'),
        props: true
      }],
  },

  {
    path: '/reporting',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'ReportingList',
        path: '',
        component: () => import('src/pages/reporting/ReportingListPage.vue')
      }]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
