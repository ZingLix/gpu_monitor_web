export default [
  {
    path: '/current',
    name: 'current',
    icon: 'smile',
    component: './Current',
  },
  {
    path: '/history',
    name: 'history',
    icon: 'smile',
    component: './History',
  },
  {
    path: '/',
    redirect: '/current',
  },
  {
    component: './404',
  },
];
