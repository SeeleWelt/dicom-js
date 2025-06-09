<template>
  <div class="switch-container">
    <div class="switch-title">{{ title }}</div>
    <label class="switch">
      <input
        type="checkbox"
        :checked="currentValue === values[1]"
        @change="toggleSwitch"
      />
      <span class="switch-slider"></span>
    </label>
    <span style="width: 30%;">{{ currentValue }}</span>
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
      required: true,
    },
    defaultValue: {
      type: [String, Number, Boolean],
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
    toggle: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      currentValue: this.defaultValue,
      state:false,
    };
  },
  mounted(){
    this.state = document.querySelector('.switch input').checked
  },
  methods: {
    toggleSwitch() {
      if(this.state)
        this.currentValue = this.values[0]
      else
        this.currentValue = this.values[1]
      this.state=!this.state
      this.toggle(this.id,this.state);
    },
  },
};
</script>

<style scoped>
.switch-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 5px;
}

.switch-title {
  margin-right: 16px;
  font-size: 16px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.switch input:checked + .switch-slider {
  background-color: #2196f3;
}

.switch input:checked + .switch-slider:before {
  transform: translateX(22px);
}
</style>