let toast = require('common.toast');
cc.Class({
    extends: cc.Component,
    properties: {
        triangle: cc.Node,          // 下拉按钮右边的小三角形
        comboLabel: cc.Label,       // 下拉按钮上显示的文本
        dropDown: cc.Node,          // 下拉框
        vLayoutNode: cc.Node,       // 垂直布局
        contentNode: cc.Node,       // 滚动视图内容
        itemPrefab: cc.Prefab       // 下拉框选项
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.dropDown.active = false;
        // 是否已经下拉
        this.isDropDown = false; 
    },
    reset(){
        this.dropDown.active = false;
        // 是否已经下拉
        this.isDropDown = false; 
        this.itemArray = null;
        this.vLayoutNode.removeAllChildren();
    },
    init(array,isZeroActive = false,callback = null){
        this.callback = callback;
        this.reset();
        if(isZeroActive !== false && isZeroActive !== null && array[isZeroActive]){
            this.comboLabel.string = array[isZeroActive];
            if(this.callback){
                this.callback(isZeroActive);
            }
        }else{
            this.comboLabel.string = '';
            if(this.callback){
                this.callback(null);
            }
        }
        this.itemArray = array;
        this.initItems();
    },
    comboboxClicked (index) {
        if(!this.itemArray || this.itemArray.length === 0){
            toast.show('获取游戏列表失败,请重启游戏后在试');
            return;
        }
        // 旋转小三角形
        this.rotateTriangle();
        // 下拉框显示与隐藏
        this.showHideDropDownBox();
        // 改变isDropDown值
        if (!this.isDropDown){
            this.isDropDown = true;
        }else{
            this.isDropDown = false;
        }
        if(this.callback && typeof index === 'number'){
            this.callback(index);
        }  
    },
    rotateTriangle () {
        // 旋转小三角形(正值为逆时针，负值为顺时针)
        if (!this.isDropDown) {
            let rotateAction = cc.rotateTo(0.5, 0).easing(cc.easeCubicActionOut());
            this.triangle.runAction(rotateAction);
        }
        else {
            let rotateAction = cc.rotateTo(0.5, 90).easing(cc.easeCubicActionOut());
            this.triangle.runAction(rotateAction);
        }
    },

    showHideDropDownBox () {
        // 下拉框显示与隐藏
        if (!this.isDropDown) 
            this.dropDown.active = true;
        else 
            this.dropDown.active = false;
    },

    initItems () {
        // 根据数组初始化下拉框中的各个选项内容
        let totalHeight = 0;
        for (let i=0; i<this.itemArray.length; i++) {
            let item = cc.instantiate(this.itemPrefab);
            item.children[0].getComponent(cc.Label).string = this.itemArray[i];
            item.getComponent('Item').initComboBox(this,i);
            this.vLayoutNode.addChild(item);
            totalHeight += item.height;
        }

        // 设置content高度
        if (totalHeight > this.contentNode.height) 
            this.contentNode.height = totalHeight;
    }
    // update (dt) {},
});
