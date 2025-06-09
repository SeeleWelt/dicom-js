<template>
    <div class="dropdown-container">
      <label >{{ title }}</label>
      <select
        v-model="currentValue"
        @change="handleSelectionChange"
        class="dropdown"
      >
        <option
          v-for="(option, index) in value"
          :key="index"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    name: "DropdownToolBar",
    props: {
      title: {
        type: String,
        required: true,
      },
      value: {
        type: Array,
        required: true,
        validator: (value) => value.every((item) => typeof item === "string"),
      },
      defaultValue: {
        type: String,
        required: true,
      },
      onSelectedValueChange: {
        type: Function,
        required: true,
      },
      typeFlag:{
        type:Number,
        required:true,
        default:0,
      }
    },
    data() {
      return {
        currentValue: this.defaultValue,
      };
    },
    methods: {
      handleSelectionChange() {
        this.onSelectedValueChange(this.currentValue,this.typeFlag);
      },
    },
  };
  </script>
  
  <style scoped>
  .dropdown-container {
    display: inline-block;
    width: 200px;
    gap: 5px;
    margin: 10px;
    font-size:16px;
  }
  label {
    font-weight: bold;
  }
  .dropdown {
    width: 100%;
    outline:none;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: rgb(255, 255, 255);
    font-size:16px;
    cursor:pointer;
  }
  </style>