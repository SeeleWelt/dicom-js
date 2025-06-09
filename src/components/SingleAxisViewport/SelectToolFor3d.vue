<template>
    <div class="my-select-component">
        <el-text>3d类型：</el-text>
        <el-select
        v-model="selectedValue"
        placeholder="请选择"
        @change="handleSelectChange"
        >
        <el-option
            v-for="presetName in presetNames"
            :key="presetName.value"
            :label="presetName.label"
            :value="presetName.value"
        ></el-option>
        </el-select>
    </div>
</template>

<script>
export default {
data() {
    return {
    presetNames:[
        { label: 'CT-腹主动脉瘤', value: 'CT-AAA' },
        { label: 'CT-腹主动脉瘤2', value: 'CT-AAA2' },
        { label: 'CT-骨骼', value: 'CT-Bone' },
        { label: 'CT-骨骼（复数）', value: 'CT-Bones' },
        { label: 'CT-心脏', value: 'CT-Cardiac' },
        { label: 'CT-心脏2', value: 'CT-Cardiac2' },
        { label: 'CT-心脏3', value: 'CT-Cardiac3' },
        { label: 'CT-胸部增强扫描', value: 'CT-Chest-Contrast-Enhanced' },
        { label: 'CT-胸部血管', value: 'CT-Chest-Vessels' },
        { label: 'CT-冠状动脉', value: 'CT-Coronary-Arteries' },
        { label: 'CT-冠状动脉2', value: 'CT-Coronary-Arteries-2' },
        { label: 'CT-冠状动脉3', value: 'CT-Coronary-Arteries-3' },
        { label: 'CT-裁剪体积骨骼', value: 'CT-Cropped-Volume-Bone' },
        { label: 'CT-脂肪', value: 'CT-Fat' },
        { label: 'CT-肝脏血管', value: 'CT-Liver-Vasculature' },
        { label: 'CT-肺部', value: 'CT-Lung' },
        { label: 'CT-最大强度投影', value: 'CT-MIP' },
        { label: 'CT-肌肉', value: 'CT-Muscle' },
        { label: 'CT-肺动脉', value: 'CT-Pulmonary-Arteries' },
        { label: 'CT-软组织', value: 'CT-Soft-Tissue' },
        { label: 'CT-空气', value: 'CT-Air' },
        { label: 'MR-血管造影', value: 'MR-Angio' },
        { label: 'MR-默认', value: 'MR-Default' },
        { label: 'MR-最大强度投影', value: 'MR-MIP' },
        { label: 'MR-T2加权脑部', value: 'MR-T2-Brain' },
        { label: 'DTI-各向异性分数脑部', value: 'DTI-FA-Brain' },
    ],
    // 选中的值
    selectedValue: 'CT-骨骼',
    };
},
methods: {
    // 处理选择变化
    handleSelectChange(value) {
        this.$emit('handleChange3dPreset', value);
    },
},
};
</script>

<style scoped>
.my-select-component {
    position: absolute;
    width: 300px;
    margin: 20px;
    left:7%;
    top:10%;
    z-index: 100;
}
</style>