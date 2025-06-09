<template>
    <div class="colorbarControlMenu" v-if="isShow" @click.stop>
        <el-row>
            <el-col :span="24">
                <el-switch
                v-model="curSwitchValue"
                active-text="显示颜色条"
                inactive-text="隐藏颜色条"
                @change="handleShowColorbar"
                >
                </el-switch>
            </el-col>
            
        </el-row>
        <el-row>
            <el-select 
                v-model="curSelectedValue"
                placeholder="颜色选择"
                size="large"
                style="width: 240px"
                @change="handleSelect"
                >
                <el-option
                    v-for="colormap in colormaps"
                    :key="colormap.zhName"
                    :label="colormap.zhName"
                    :value="colormap.Name"
                />
            </el-select>
        </el-row>
    </div>
    
</template>

<script>
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
let colormaps = vtkColorMaps.rgbPresetNames.map((presetName) =>
  vtkColorMaps.getPresetByName(presetName)
);
console.log("颜色条：",colormaps)
// 创建一个映射关系，将英文名映射到中文名
const nameMapping = {
  '2hot': '双热',
  'Asymmtrical Earth Tones (6_21b)': '非对称性土色调',
  'BLUE-WHITE': '蓝白',
  'BkBu': '黑蓝',
  'BkCy': '黑青',
  'BkGn': '黑绿',
  'BkMa': '黑品红',
  'BkRd': '黑红',
  'Black, Blue and White': '黑蓝白',
  'Black, Orange and White': '黑橙白',
  'Black-Body Radiation': '黑体辐射',
  'Blue to Red Rainbow': '蓝到红彩虹',
  'Blue to Yellow': '蓝到黄',
  'Blues': '蓝色系',
  'BrBG': '棕蓝绿',
  'BrOrYl': '棕橙黄',
  'BuGn': '蓝绿',
  'BuGnYl': '蓝绿黄',
  'BuPu': '蓝紫',
  'BuRd': '蓝红',
  'CIELab Blue to Red': 'CIELab蓝到红',
  'CIELab_blue2red': 'CIELab蓝到红',
  'Cold and Hot': '冷热',
  'Cool to Warm': '冷到暖',
  'Cool to Warm (Extended)': '冷到暖（扩展）',
  'GBBr': '绿蓝棕',
  'GREEN-WHITE_LINEAR': '绿白线性',
  'GYPi': '灰黄品红',
  'GnBu': '绿蓝',
  'GnBuPu': '绿蓝紫',
  'GnRP': '绿红品红',
  'GnYlRd': '绿黄红',
  'Grayscale': '灰度',
  'Green-Blue Asymmetric Divergent (62Blbc)': '绿蓝不对称发散',
  'Greens': '绿色系',
  'GyRd': '灰红',
  'Haze': '薄雾',
  'Haze_cyan': '薄雾青',
  'Haze_green': '薄雾绿',
  'Haze_lime': '薄雾青柠',
  'Inferno (matplotlib)': '地狱（matplotlib）',
  'Linear Blue (8_31f)': '线性蓝',
  'Linear YGB 1211g': '线性黄绿蓝',
  'Magma (matplotlib)': '岩浆（matplotlib）',
  'Muted Blue-Green': '柔和蓝绿',
  'OrPu': '橙紫',
  'Oranges': '橙色系',
  'PRGn': '紫绿',
  'PiYG': '粉绿',
  'Plasma (matplotlib)': '等离子体（matplotlib）',
  'PuBu': '紫蓝',
  'PuOr': '紫橙',
  'PuRd': '紫红',
  'Purples': '紫色系',
  'RED-PURPLE': '红紫',
  'RED_TEMPERATURE': '红温',
  'Rainbow Blended Black': '彩虹混合黑',
  'Rainbow Blended Grey': '彩虹混合灰',
  'Rainbow Blended White': '彩虹混合白',
  'Rainbow Desaturated': '彩虹去饱和',
  'RdOr': '红橙',
  'RdOrYl': '红橙黄',
  'RdPu': '红紫',
  'Red to Blue Rainbow': '红到蓝彩虹',
  'Reds': '红色系',
  'Spectral_lowBlue': '低蓝光谱',
  'Viridis (matplotlib)': '维迪斯（matplotlib）',
  'Warm to Cool': '暖到冷',
  'Warm to Cool (Extended)': '暖到冷（扩展）',
  'X Ray': 'X射线',
  'Yellow 15': '黄色15',
  'blot': '污点',
  'blue2cyan': '蓝到青',
  'blue2yellow': '蓝到黄',
  'bone_Matlab': '骨色（Matlab）',
  'coolwarm': '冷暖',
  'copper_Matlab': '铜色（Matlab）',
  'erdc_blue2cyan_BW': 'ERDC蓝到青（黑白）',
  'erdc_blue2gold': 'ERDC蓝到金',
  'erdc_blue2gold_BW': 'ERDC蓝到金（黑白）',
  'erdc_blue2green_BW': 'ERDC蓝到绿（黑白）',
  'erdc_blue2green_muted': 'ERDC蓝到绿（柔和）',
  'erdc_blue2yellow': 'ERDC蓝到黄',
  'erdc_blue_BW': 'ERDC蓝（黑白）',
  'erdc_brown_BW': 'ERDC棕（黑白）',
  'erdc_cyan2orange': 'ERDC青到橙',
  'erdc_divHi_purpleGreen': 'ERDC高对比度紫绿',
  'erdc_divHi_purpleGreen_dim': 'ERDC高对比度紫绿（暗）',
  'erdc_divLow_icePeach': 'ERDC低对比度冰桃',
  'erdc_divLow_purpleGreen': 'ERDC低对比度紫绿',
  'erdc_gold_BW': 'ERDC金（黑白）',
  'erdc_green2yellow_BW': 'ERDC绿到黄（黑白）',
  'erdc_iceFire_H': 'ERDC冰火高',
  'erdc_iceFire_L': 'ERDC冰火低',
  'erdc_magenta_BW': 'ERDC品红（黑白）',
  'erdc_marine2gold_BW': 'ERDC海军蓝到金（黑白）',
  'erdc_orange_BW': 'ERDC橙（黑白）',
  'erdc_pbj_lin': 'ERDC花生酱果冻线性',
  'erdc_purple2green': 'ERDC紫到绿',
  'erdc_purple2green_dark': 'ERDC紫到绿（暗）',
  'erdc_purple2pink_BW': 'ERDC紫到粉（黑白）',
  'erdc_purple_BW': 'ERDC紫（黑白）',
  'erdc_rainbow_bright': 'ERDC彩虹亮',
  'erdc_rainbow_dark': 'ERDC彩虹暗',
  'erdc_red2purple_BW': 'ERDC红到紫（黑白）',
  'erdc_red2yellow_BW': 'ERDC红到黄（黑白）',
  'erdc_red_BW': 'ERDC红（黑白）',
  'erdc_sapphire2gold_BW': 'ERDC蓝宝石到金（黑白）',
  'gist_earth': '地球',
  'gray_Matlab': '灰度（Matlab）',
  'heated_object': '加热物体',
  'hsv': 'HSV',
  'hue_L60': '色调L60',
  'jet': '喷气',
  'magenta': '品红',
  'nic_CubicL': 'NIC立方L',
  'nic_CubicYF': 'NIC立方YF',
  'nic_Edge': 'NIC边缘',
  'pink_Matlab': '粉色（Matlab）',
  'rainbow': '彩虹'
};

// 遍历数组并添加 zhName 属性
colormaps.forEach(colorMap => {
  const zhName = nameMapping[colorMap.Name];
  if (zhName) {
    colorMap.zhName = zhName;
  } else {
    colorMap.zhName = '未知'; // 如果没有对应的中文名，可以设置为默认值
  }
});

let defaultColormap = colormaps.find(colormap=>colormap.Name==="Grayscale");
colormaps = colormaps.filter(colormap => colormap.Name !== "Grayscale");
defaultColormap.zhName = '默认'
colormaps.unshift(defaultColormap)
export default{
    props:{
        isShow:{
            type:Boolean,
            default:false,
        },
        colorbarName:{
            type:String,
            default:'默认',
        },
        isShowColorbar:{
            type:Boolean,
            default:false,
        }
    },
    mounted(){
        this.curSelectedValue=this.colorbarName,
        this.curSwitchValue = this.isShowColorbar
    },
    data(){
        return{
            curSwitchValue:false,
            curSelectedValue:"默认",
            colormaps:colormaps,
        }
    },
    methods:{
        handleSelect()
        {
            this.$emit('handleSelectColorbar',this.curSelectedValue)
        },
        handleShowColorbar()
        {
            this.$emit('handleShowColorbar',this.curSwitchValue)
        }
    }
}
</script>

<style>

</style>