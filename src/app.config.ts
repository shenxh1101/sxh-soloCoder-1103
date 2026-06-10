export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/cart/index',
    'pages/member/index',
    'pages/detail/index',
    'pages/pickup/index',
    'pages/staff/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '社区美食',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页菜单',
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
      },
      {
        pagePath: 'pages/member/index',
        text: '会员中心',
      },
    ],
  },
})