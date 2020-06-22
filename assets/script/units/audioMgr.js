var audioMgr = class{
    static getInstance() {
        if (!this.instance) {
            this.instance = new audioMgr();
            this.bgmCode = BGMS.BGM_NONE;
        }
        return this.instance;
    }
    playBgmFromURL(url,isLook = true) {
        if (G.AUDIO.openBgm) {
            cc.audioEngine.stopMusic();
            cc.loader.load({url:url, type:cc.AudioClip}, function (err, clip) {
                if (!err) {
                    cc.audioEngine.playMusic(clip, isLook, G.AUDIO.bgmVol);
                }
            })
        }
    }
    playEffect(url,isLook = false) {
        if (G.AUDIO.openEff) {
            cc.loader.load({url:url, type:cc.AudioClip}, function (err, clip) {
                if (!err) {
                    cc.audioEngine.playEffect(clip, isLook, G.AUDIO.effVol);
                }
            })
        }
    }
    /**
    * @description: 播放本地背景音
    * @param {cc.Enum} srccode 音频文件枚举
    * @param {boolean} isLook 是否循环播放
    */
    playBgmFromLocal(srccode,isLook = false){
        cc.audioEngine.stopMusic();
        this.bgmCode = srccode;
        cc.loader.loadRes(G.AUDIO.bgmFile[srccode], cc.AudioClip, function (err, clip) {
            cc.audioEngine.playMusic(clip, isLook,G.AUDIO.bgmVol);

        });
    }
    /**
    * @description: 播放本地音效
    * @param {cc.Enum} srccode 音频文件枚举
    * @param {boolean} isLook 是否循环播放
    */
    playEffectFromLocal(srccode,isLook = false){
        cc.loader.loadRes(G.AUDIO.effFile[srccode], cc.AudioClip, function (err, clip) {
            cc.audioEngine.playEffect(clip, isLook,G.AUDIO.effVol);
        });
    }
    /**
    * @description: 是否在播放背景音乐
    * @return {boolean}
    */
    isMusicPlaying(){
        return cc.audioEngine.isMusicPlaying();
    }
    /**
    * @description: 获取当前播放的背景音乐枚举
    * @return {Number}
    */
    getBgmCode(){
        return this.bgmCode;
    }
    stopBgm(){
        if(this.isMusicPlaying()){
            this.bgmCode = BGMS.BGM_NONE;
            cc.audioEngine.stopMusic();
        }
    }
    stopEff(){
        cc.audioEngine.stopEffect()
    }
    pauseBgm(){
        cc.audioEngine.pauseMusic();
    }
    resumeBgm(){
        cc.audioEngine.resumeMusic();
    }
    setBgmVol(vol){
        cc.audioEngine.setMusicVolume(vol || vol === 0?vol:G.AUDIO.bgmVol);
    }
    setEffVol(vol){
        cc.audioEngine.setEffectsVolume(vol || vol === 0?vol:G.AUDIO.effVol);
    }
};