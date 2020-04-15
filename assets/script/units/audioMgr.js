var audioMgr = class{
    static getInstance() {
        if (!this.instance) {
            this.instance = new audioMgr();
        }
        return this.instance;
    }
    playBgmFromURL(url,isLook = true) {
        if (G.AUDIO.openBgm) {
            cc.audioEngine.stopMusic();
            let self = this;
            cc.loader.load({url:url, type:cc.AudioClip}, function (err, clip) {
                if (!err) {
                    cc.audioEngine.playMusic(clip, isLook, G.AUDIO.bgmVol);
                }
            })
        }
    }
    playEffect(url,isLook = fasle) {
        if (G.AUDIO.openEff) {
            cc.loader.load({url:url, type:cc.AudioClip}, function (err, clip) {
                if (!err) {
                    cc.audioEngine.playEffect(clip, isLook, G.AUDIO.effVol);
                }
            })
        }
    }
    playBgmFromLocal(src,isLook = fasle){
        if (G.AUDIO.openBgm) {
            cc.audioEngine.stopMusic();
            cc.loader.loadRes(src, cc.AudioClip, function (err, clip) {
                cc.audioEngine.playMusic(clip, isLook,G.AUDIO.bgmVol);
            });
        }
    }
    playEffectFromLocal(src,isLook = fasle){
        if (G.AUDIO.openEff) {
            cc.loader.loadRes(src, cc.AudioClip, function (err, clip) {
                cc.audioEngine.playEffect(clip, isLook,G.AUDIO.effVol);
            });
        }  
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