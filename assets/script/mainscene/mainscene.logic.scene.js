let M = {}
M.init = function(component,frame){
    this.prototype = component;
    this.frame = frame;
}
M.reset = function(){

}
M.start = function(){
    this.frame.view.base.home.setStateText('开牌中');
    this.codeArr = G.USER.choose_gameID === 0?[
        '015010',
        '025020',
        '035030',
        '046040',
        '057050',
        '068060',
        '076100',
        '087110',
        '098120',
        '101000',
        '112000',
        '128080',
        '131000',
        '142000',
        '158080',
        '167010',
        '177020',
        '187030',
    ]:[
        '016010',
        '026020',
        '036030',
        '046040',
        '056050',
        '066060',
        '076070',
        '086080',
    ];
    let i = 0;
    this.timer = setInterval(()=>{
        if(this.codeArr[i]){
            this.frame.view.base.home.openCard(this.codeArr[i++]);
        }else{
            clearInterval(this.timer);
            this.timer = null;
        } 
    },1500);
}
M.onDestroy = function(){
    if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
    }
}
M.addEvent = function(){

}
export default M;