export default defineVuePlugin({
  hooks: {
    "app:mounted": () => {
      console.log("hello from plugin hook");
    },
  },

  setup: () => {
    return {
      provide: {
        test: () => "hey is test",
      },
    };
  },
});
