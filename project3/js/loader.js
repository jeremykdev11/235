WebFont.load({
    google: {
      families: ["Tiny5"],
    },
    active: (e) => {
      console.log("Font loaded");
      loadImages();
    },
  });