<template>
  <div class="color-wheel-container">
    <label>{{ title }}</label>
    <input
      type="color"
      v-model="currentColor"
      @input="handleColorChange"
      class="color-wheel"
    />
  </div>
</template>

<script>
export default {
  props: {
    id:{
      type:Number,
      required:true,
    },
    title: {
      type: String,
      default: "Select Color",
    },
    defaultValue: {
      type: String,
      default: "#ffffff", // 默认颜色为白色
    },
    onSelectedValueChange: {
      type: Function,
      required: true,
    },

  },
  data() {
    return {
      currentColor: this.defaultValue,
    };
  },
  methods: {
    handleColorChange() {
      this.onSelectedValueChange(this.id,this.currentColor);
    },
  },
};
</script>

<style scoped>
.color-wheel-container {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  margin:10px;
  font-size:16px;
}
label {
  font-weight: bold;
}
.color-wheel {
  cursor: pointer;
}
.color-preview {
  width: 50px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>