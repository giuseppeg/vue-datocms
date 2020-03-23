import PropTypes from "@znck/prop-types";

const absolutePositioning = {
  position: "absolute",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};

// @vue/component
export const Image = {
  props: {
    data: PropTypes.shape({
      aspectRatio: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      base64: PropTypes.string,
      height: PropTypes.number,
      sizes: PropTypes.string,
      src: PropTypes.string,
      srcSet: PropTypes.string,
      webpSrcSet: PropTypes.string,
      bgColor: PropTypes.string,
      alt: PropTypes.string,
      title: PropTypes.string
    }).isRequired,
    pictureClass: PropTypes.string,
    fadeInDuration: PropTypes.number,
    intersectionTreshold: PropTypes.number.defaultValue(0),
    intersectionMargin: PropTypes.string.defaultValue("0px 0px 0px 0px"),
    lazyLoad: PropTypes.bool.defaultValue(true),
    pictureStyle: PropTypes.object,
    rootStyle: PropTypes.object,
    explicitWidth: PropTypes.bool
  },
  inheritAttrs: false,
  data: () => ({
    observer: null,
    inView: false,
    loaded: false
  }),
  computed: {
    addImage() {
      if (!this.lazyLoad) {
        return true;
      }

      if (typeof window === "undefined") {
        return false;
      }

      if ("IntersectionObserver" in window) {
        return this.inView || this.loaded;
      }

      return true;
    },
    showImage() {
      if (!this.lazyLoad) {
        return true;
      }

      if (typeof window === "undefined") {
        return false;
      }

      if ("IntersectionObserver" in window) {
        return this.loaded;
      }

      return true;
    }
  },
  methods: {
    load() {
      if (this.$el.getAttribute("src") !== this.srcPlaceholder) {
        this.loaded = true;
      }
    }
  },
  render(h) {
    const {
      data,
      fadeInDuration,
      pictureClass,
      pictureStyle,
      showImage,
      addImage,
      rootStyle,
      explicitWidth
    } = this;

    const webpSource = data.webpSrcSet && (
      <source srcset={data.webpSrcSet} sizes={data.sizes} type="image/webp" />
    );

    const regularSource = data.srcSet && (
      <source srcset={data.srcSet} sizes={data.sizes} />
    );

    const placeholder = (
      <div
        style={{
          backgroundImage: data.base64 ? `url(${data.base64})` : null,
          backgroundColor: data.bgColor,
          backgroundSize: "cover",
          opacity: showImage ? 0 : 1,
          transition:
            !fadeInDuration || fadeInDuration > 0
              ? `opacity ${fadeInDuration || 500}ms ${fadeInDuration || 500}ms`
              : null,
          ...absolutePositioning
        }}
      />
    );

    const { width, aspectRatio } = data;
    const height = data.height || width / aspectRatio;

    const sizer = (
      <svg
        class={pictureClass}
        style={{
          width: explicitWidth ? `${width}px` : "100%",
          height: "auto",
          display: "block",
          ...pictureStyle
        }}
        height={height}
        width={width}
      />
    );

    return (
      <div
        style={{
          display: "inline-block",
          overflow: "hidden",
          ...rootStyle,
          position: "relative"
        }}
      >
        {sizer}
        {placeholder}
        {addImage && (
          <picture
            class={pictureClass}
            style={{
              ...absolutePositioning,
              opacity: showImage ? 1 : 0,
              transition:
                !fadeInDuration || fadeInDuration > 0
                  ? `opacity ${fadeInDuration || 500}ms`
                  : null
            }}
          >
            {webpSource}
            {regularSource}
            {data.src && (
              <img
                src={data.src}
                alt={data.alt}
                title={data.title}
                vOn:load={this.load}
                style={{ width: "100%" }}
              />
            )}
          </picture>
        )}
        {h("noscript", {
          inlineTemplate: {
            render() {
              return (
                <picture class={pictureClass} style={pictureStyle}>
                  {webpSource}
                  {regularSource}
                  {data.src && (
                    <img src={data.src} alt={data.alt} title={data.title} />
                  )}
                </picture>
              );
            },
            staticRenderFns: []
          }
        })}
      </div>
    );
  },
  mounted() {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        entries => {
          const image = entries[0];
          if (image.isIntersecting) {
            this.inView = true;
            this.observer.disconnect();
          }
        },
        {
          threshold: this.intersectionTreshold,
          rootMargin: this.intersectionMargin
        }
      );
      this.observer.observe(this.$el);
    }
  },
  destroyed() {
    if ("IntersectionObserver" in window && this.observer) {
      this.observer.disconnect();
    }
  }
};

export const DatocmsImagePlugin = {
  install: Vue => {
    Vue.component("DatocmsImage", Image);
  }
};
