export default [

  {
    path: '/history',
    name: 'history',
    icon: 'smile',
    component: './History',
  },
  {
    path: '/current',
    name: 'current',
    icon: 'smile',
    component: './Current',
  },
  {
    path: '/',
    redirect: '/history',
  },
  {
    component: './404',
  },
];
