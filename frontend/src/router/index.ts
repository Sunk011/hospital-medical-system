import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import i18n from '@/locales';

// Route definitions
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: 'auth.login',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
          title: 'nav.dashboard',
        },
      },
      {
        path: 'dashboard',
        redirect: '/',
      },
      {
        path: 'patients',
        name: 'PatientList',
        component: () => import('@/views/patient/PatientList.vue'),
        meta: {
          title: 'nav.patients',
        },
      },
      {
        path: 'patients/:id',
        name: 'PatientDetail',
        component: () => import('@/views/patient/PatientDetail.vue'),
        meta: {
          title: 'patient.patientDetail',
        },
      },
      {
        path: 'doctors',
        name: 'DoctorList',
        component: () => import('@/views/doctor/DoctorList.vue'),
        meta: {
          title: 'nav.doctors',
        },
      },
      {
        path: 'doctors/:id',
        name: 'DoctorDetail',
        component: () => import('@/views/doctor/DoctorDetail.vue'),
        meta: {
          title: 'doctor.doctorDetail',
        },
      },
      {
        path: 'medical-records',
        name: 'MedicalRecordList',
        component: () => import('@/views/medicalRecord/MedicalRecordList.vue'),
        meta: {
          title: 'nav.medicalRecords',
        },
      },
      {
        path: 'medical-records/:id',
        name: 'MedicalRecordDetail',
        component: () => import('@/views/medicalRecord/MedicalRecordDetail.vue'),
        meta: {
          title: 'medicalRecord.recordDetail',
        },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Statistics.vue'),
        meta: {
          title: 'statistics.title',
        },
      },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: 'notFound.title',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// Navigation guards
router.beforeEach((to, _from, next) => {
  // Set page title
  const titleKey = to.meta.title as string;
  const title = titleKey ? i18n.global.t(titleKey) : '';
  document.title = title ? `${title} - Hospital Medical System` : 'Hospital Medical System';

  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next('/');
  } else {
    next();
  }
});

export default router;
