<template>
  <div class="text-container" :style="containerStyle">
    <div v-for="(text, index) in texts" :key="index" class="text-line">{{ text }}</div>
  </div>
</template>

<script>
export default {
  props: {
    element:{
      type:Element,
      required:true,
    },
    texts: {
      type: Array,
      required: true,
    },
    position: {
      type: String,
      default: "top",
    },
  },
  data() {
    return {
      containerStyle: {},
    };
  },
  mounted(){
    this.updatePosition()
  },
  methods: {
    updatePosition() {
      const text_container = document.querySelector('.text-container')
      const position = this.position.toLowerCase();
      this.containerStyle = {
        position: "absolute",
        whiteSpace: "pre",
        textAlign: "center",
      };

      switch (position) {
        case "top":
          this.containerStyle.top = "0";
          this.containerStyle.left = "50%";
          this.containerStyle.transform = "translateX(-50%)";
          break;
        case "bottom":
          this.containerStyle.bottom = "0";
          this.containerStyle.left = "50%";
          this.containerStyle.transform = "translateX(-50%)";
          break;
        case "left":
          this.containerStyle.left = "0";
          this.containerStyle.top = "50%";
          this.containerStyle.transform = "translateY(-50%)";
          this.containerStyle.textAlign = "right";
          break;
        case "right":
          this.containerStyle.right = "0";
          this.containerStyle.top = "50%";
          this.containerStyle.transform = "translateY(-50%)";
          this.containerStyle.textAlign = "left";
          break;
        case "top-left":
          this.containerStyle.top = "0";
          this.containerStyle.left = "0";
          break;
        case "top-right":
          this.containerStyle.top = "0";
          this.containerStyle.right = "0";
          break;
        case "bottom-left":
          this.containerStyle.bottom = "0";
          this.containerStyle.left = "0";
          break;
        case "bottom-right":
          this.containerStyle.bottom = "0";
          this.containerStyle.right = "0";
          break;
        default:
          console.warn("Invalid position. Defaulting to 'top'.");
          this.containerStyle.top = "0";
          this.containerStyle.left = "50%";
          this.containerStyle.transform = "translateX(-50%)";
      }
      this.element.appendChild(text_container)
    },
  },
};
</script>

<style scoped>
.text-container {
  pointer-events: none; /* 防止文本容器影响交互 */
  color:white;
  font-size:16px;
}
.text-line {
  margin: 0;
  padding: 0;
}
</style>