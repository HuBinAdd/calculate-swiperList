const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('../../public/core/object-assign.js')
}
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    uid:'',
    userType:'xuechetiku',
    isNewExam:true,//是否使用后台答案
    isLoading:false,//加载
    swiper:{
      active:0
    },
    layerlayer:{
      isLayerShow:false,//默认弹窗
      layerAnimation:{},//弹窗动画
    },
    storeUrl:'?m=Exam&c=Server&a=collection',//收藏URL
    answerUrl:'?m=Exam&c=Server&a=collection',//提交答案URL
    answers:{
      onLoadUrl:'?m=Exam&c=Server&a=getQuestionID',//题目号链接      
      start:0,//初始题号
      end:0,//结束题号
      allLists:[],//题号数据
      activeNum:0,//当前显示条数
      onceLoadLength:5,//一次向俩端加载条数
      url:'?m=Exam&c=Server&a=getQuestion',//题目详情链接
      isShowTip:false//默认是否显示提示
    }
  },
  //单选逻辑
  tapRadio:function(e){
    var thisOption=e.currentTarget.dataset.option.split(","),
        list = this.data.answers.allLists[this.data.answers.activeNum].options.map(function(option,i){ 
          if(thisOption[1] == option.tip){
            if(!option.isActive){
              option.isActive = true;
              option.isSelect = true;       
            }else{
              option.isActive = false;
              option.isSelect = false;
            }
          }
          return option
        });      
    this.data.answers.allLists[this.data.answers.activeNum].options = list;
    this.tapSelect(e);
  },
  //多选逻辑
  tapCheckbox:function(e){
    
    if(this.data.answers.allLists[this.data.answers.activeNum].isNoFirst){
      return false;
    }

    var thisOption=e.currentTarget.dataset.option.split(","),
        list = this.data.answers.allLists[this.data.answers.activeNum].options.map(function(option,i){ 
          if(thisOption[1] == option.tip){
            if(!option.isActive){
              option.isActive = true;
              option.isSelect = true;       
            }else{
              option.isActive = false;
              option.isSelect = false;
            }
          }
          return option
        });      
    this.data.answers.allLists[this.data.answers.activeNum].options = list;
    this.setData(this.data);   
  },
  //答案判断逻辑
  tapSelect:function(e){
    if(this.data.answers.allLists[this.data.answers.activeNum].isNoFirst){
      return false;
    }    
    
    var answered = 0,bool=true;
    this.data.answers.allLists[this.data.answers.activeNum].options.forEach(function(option,i){
      //解析答案数字编码
      if(option.isSelect){
        switch(option.tip){
          case 'A':
            answered = + 16;
          break;
          case 'B':
            answered = + 32;
          break;
          case 'C':
            answered = + 64;
          break;
          case 'D':
            answered = + 128;
          break;
          default:
          console.log('超出设定');
        }
      }
      if(option.isSelect && !option.correct){
        bool=false;
      }
      if(!option.isSelect && option.correct){
        bool=false;
      }
    });  
    //存放本次答案数字编码
    this.data.answers.allLists[this.data.answers.activeNum].answered = answered;
    //存放本次答案选项
    // this.data.answers.allLists[this.data.answers.activeNum].options = this.data.answers.list[this.data.swiper.active].options;
    //改变题目状态为已答
    this.data.answers.allLists[this.data.answers.activeNum].isNoFirst = true;
    if(bool){
      this.data.answers.allLists[this.data.answers.activeNum].isAnswer = 1;
      this.data.answers.success++
    }else{
      this.data.answers.allLists[this.data.answers.activeNum].isAnswer = 2;      
      this.data.answers.error++
    }

    this.data.isShowTip = !bool;
    this.setData(this.data);
    //延迟加载滑动
    if(this.data.answers.activeNum + 1 < this.data.answers.allLists.length){
      setTimeout(() => this.onSwiper('left'),200);
    }
    //传答案
    https.setAnswer(this.data.answerUrl,{
      uid:'1217',
      questionID:this.data.answers.allLists[this.data.answers.activeNum].id,
      answer:this.data.answers.allLists[this.data.answers.activeNum].isAnswer,
      choose:this.data.answers.allLists[this.data.answers.activeNum].answered
    })
  },
  //页码切换列表效果
  pageClick:function(){
    var layerAnimation = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 500,
          timingFunction: "ease",
          delay: 0
        });
    if(!this.data.layerlayer.isLayerShow){ 
      layerAnimation.translate3d(0,0,0).step();
    }else{
      layerAnimation.translate3d(0,'100%',0).step();
    }
    this.data.layerlayer.isLayerShow = !this.data.layerlayer.isLayerShow;
    this.data.layerlayer.layerAnimation =  layerAnimation; 
    this.setData(this.data);
  },
  //页码切换列表收缩
  layerFooterClick:function(){
    var layerAnimation = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 500,
          timingFunction: "ease",
          delay: 0
        });
    layerAnimation.translate3d(0,'100%',0).step();
    this.data.layerlayer.isLayerShow = false;
    this.data.layerlayer.layerAnimation =  layerAnimation; 
    this.setData(this.data);
  },
  //收藏逻辑
  collectList:function(){
    var isStore = 0 ;
    this.data.answers.allLists[this.data.answers.activeNum].isStore = !this.data.answers.allLists[this.data.answers.activeNum].isStore;
    this.setData( this.data);
    isStore = this.data.answers.allLists[this.data.answers.activeNum].isStore? 1 : 0 ;
    https.setStore(this.data.storeUrl,{
      uid:'1217',
      userType:'xuechetiku',
      questionID:this.data.answers.allLists[this.data.answers.activeNum].id,
      collection:isStore
    }).then( data => {

    })
    .catch( e => {
      this.callBackError(e.message);
    });
  },
  //题号变更逻辑
  setActiveNum:function(e){
    var thisOption=e.currentTarget.dataset.option - 0;
    this.data.answers.activeNum = thisOption;
    this.data.isLoading = false;  
    this.layerFooterClick();
    this.getSubject();
  },
  //swiper切换
  setEvent:function(e){
    this.data.swiper.touchstartEvent = e;
    return false;
  },
  //滑动结束
  touchEnd:function(e){
    this.onSwiper(this.getDirection(this.data.swiper.touchstartEvent,e));
    return false;
  },
  //swiper切换
  onSwiper:function(dire){
    console.log(dire)
    var that = this,
        active = 0,
        storeSetTime,
        animationO = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "ease",
          delay: 0
        }),
        animationT = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "ease",
          delay: 0
        }),
        animationS = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "ease",
          delay: 0
        });
    if(!this.$isLock){//锁屏控制
      this.$isLock = true;
      if(dire == 'bottom' || dire == 'top' || !dire){
        this.$isLock = false;
        return false;
      }
      if(dire == 'right'){
        animationO.translate3d('0',0,0).step();
        animationT.translate3d('100%',0,0).step();
        if(this.data.answers.activeNum > this.data.answers.start){
          active = - 1;
        }else{
          this.$isLock = false;
          return;
        }
      }
      if(dire == 'left'){
        animationT.translate3d('-100%',0,0).step();
        animationS.translate3d('0',0,0).step();
        if(this.data.answers.activeNum < this.data.answers.end){
          active = 1;
        }else{
          this.$isLock = false;
          return;
        }
      }
      this.data.swiper.animationO = animationO.export();
      this.data.swiper.animationT = animationT.export();
      this.data.swiper.animationS = animationS.export();
      this.setData(this.data);
      console.log(this.data.answers.activeNum + 1)   
      console.log(this.data.answers.allLists[this.data.answers.activeNum + 1].tip)   
      setTimeout(function(){ 
        that.setHtmlsetHtml(active);
      },200);
    }
  },
  //修改页面至正常位置
  setHtmlsetHtml:function(active){
    var animationO = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          timingFunction: "ease",
          delay: 0
        }),
        animationT = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          timingFunction: "ease",
          delay: 0
        }),
        animationS = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          timingFunction: "ease",
          delay: 0
        });     
      animationO.translate3d('-100%',0,0).step();
      animationT.translate3d('0',0,0).step();
      animationS.translate3d('100%',0,0).step();
      this.data.swiper.active = this.data.swiper.active + active;
      this.data.answers.activeNum = this.data.answers.activeNum + active;
      this.data.swiper.animationO = animationO;
      this.data.swiper.animationT = animationT;
      this.data.swiper.animationS = animationS;
      console.log(this.data.answers.activeNum)   
      console.log(this.data.answers.allLists[this.data.answers.activeNum].tip)   
      this.setData(this.data);
      //调用加载数据方法
      if( (this.data.swiper.active == 2 && this.data.answers.start > 0) || (this.data.swiper.active+2 == this.data.answers.list.length && this.data.answers.end+1 < this.data.answers.allLists.length)){
        this.getSubject();
      }
      //调用滑动结束回调
      if(this.isLockCall && typeof this.isLockCall == 'function'){
        this.isLockCall();
        this.isLockCall = false;
      }
      this.$isLock = false;
  },
  //获得手势方向
  getDirection:function(startEvent,endEvent){
    var x = endEvent.changedTouches[0].clientX - startEvent.changedTouches[0].clientX,
        y = endEvent.changedTouches[0].clientY - startEvent.changedTouches[0].clientY,
        pi=360*Math.atan(y/x)/(2*Math.PI);
        if(pi<25 && pi>-25 && x>0 && Math.abs(x) > 10){
          return 'right';
        }
        if(pi<25 && pi>-25 && x<0 && Math.abs(x) > 10){
          return 'left';
        }
        if((pi<-75 || pi>750) && y>0 && Math.abs(y) > 10){
          return 'bottom';
        }
        if((pi<-75 || pi>75) && y<0 && Math.abs(y) > 10){
          return 'top';
        }
  },
  //切换题目逻辑
  getSubject:function(){
    var that=this,start = this.data.answers.activeNum - this.data.answers.onceLoadLength,end = this.data.answers.activeNum + this.data.answers.onceLoadLength,params;
    start = start > 0 ? start : 0 ;
    end = end+1 >= this.data.answers.allLists.length ? this.data.answers.allLists.length : end ;
    //存放下次展示allallList数据
    params = this.data.answers.allLists.slice(start,end+1);
    //存放展示allallList数据ID
    params = params.map(function(data){
      //后台需要int型
      return data.id-0
    });
    https.find(this.data.answers.url,{questionID:params},this.data.isNewExam)
      .then(d => {
         //注册滑动结束回调
          if(this.$isLock){
            this.isLockCall = ((d) => {
                return this.callBackGetSubject(d,start,end);
            })(d)
          }else{  
            this.callBackGetSubject(d,start,end);
          }
      })
      .catch(e => {
        this.callBackError(e.message);
      })
  },
  //详情数据加载的回调
  callBackGetSubject:function(d,start,end){
      d.data.forEach((data,i) => {
        this.data.answers.allLists[start+ i] = Object.assign({},data,this.data.answers.allLists[start + i]);
      })
      this.data.answers.list = d.data;
      this.data.isLoading = false;  
      this.data.answers.list = d.data;   
      this.data.answers.start = start;
      this.data.answers.end = end;
      this.data.swiper.active = this.data.answers.activeNum-this.data.answers.start;  
      this.setData(this.data);      
  },
  //错误的回调
  callBackError:function(e){
      wx.showModal({
        title: '错误',
        content: '错误提示是：'+ e ,
        showCancel:false,
        confirmText:'确认关闭',
        success: function(res) {
          this.$isLock = false;
          // if (res.confirm) {
          //   console.log('用户点击确定')
          // }
        }
      })
  },
  onLoad (params) {
      https.initialize(this.data.answers.onLoadUrl,{},this.data.isNewExam)
      .then(d => {
          this.data.answers.allLists = d.data;
          this.data.answers.success = d.success;
          this.data.answers.error = d.error;
          this.data.answers.loading = false;    
          this.setData(this.data);
          this.getSubject();
      })
      .catch(e => {
        this.callBackError(e.message);
        // this.setData({ subtitle: '获取数据异常', movies: [], loading: false })
        // console.error(e)
      });
  },
  onUnload(){//页面卸载

  }
});