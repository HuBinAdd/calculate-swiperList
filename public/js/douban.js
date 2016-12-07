const API_URL = 'https://www.1217.com',
      Q = require('../core/Q.js');

if(!Object.assign) {
  Object.assign = require('../core/object-assign.js')
}

//返回选项
function getOption(num){
  var answer=[];
  if(num >= 128){//解析答案
      answer.push('d');
      num = num - 128; 
    }

    if(num >= 64){//解析答案
      answer.push('c');
      num = num - 64; 
    }

    if(num >= 32){//解析答案
      answer.push('b');
      num = num- 32; 
    }

    if(num == 16){//解析答案
      answer.push('a');
    }
    return answer
}
function preProcessData(datas,isNewExam){
  if(!datas.msg || datas.msg != "成功"){
    //报错
    throw new Error(data.data);
  }

  datas.data = datas.data.map(function(data,index){
    
    var list = {},order=['a','b','c','d','e','f','g','h'],answer=[],answered=[];
    switch (data.option_type){//解析题目类型
      case '0':
      list.type = '判断';
      break;
      case '1':
      list.type = '单选';
      break;
      case '2':
      list.type = '多选';
      break;
    };

    //返回正确答案
    answer = getOption(data.answer_);
    //返回已选择的答案
    answered = getOption(128 || 0);

    list.isStore = false;//是否收藏
    list.tip = data.question_//试题详解
    list.isShowTip = false;//是否显示提示
    list.media_type = data.media_type;//媒体类型0：无资源，1：图片，2：视屏
    list.media_url = data.media_content;//媒体链接
    list.media_width = data.media_width;//媒体宽度
    list.media_height = data.media_height;//媒体高度
    list.id = data.question_id;//题号
    list.content = data.question_;//问题正文
    list.options=[];
    //修正答案
    
    order.every(function(v,i){
      var arr={};
      if(!!data['option_'+v] && data['option_'+v] !== "null"){      
        arr.tip = v.toUpperCase();
        arr.correct= answer.indexOf(v) >= 0 ?1:0;//是否是正确答案
        arr.isSelect = (answered.indexOf(v) >=0 && isNewExam) ? true : false; //是否已选择 
        arr.content = data['option_'+v];
        list.options.push(arr);
        return true;
      }else{
        return false;
      }
    })
    return list;
  })
  return datas;
}

function preProcessInitData(data,isNewExam){
  if(!data.msg || data.msg != "成功"){
    //报错
    throw new Error(data.data);
  }
  
  var list = {};
  list.status = data.status;
  list.msg = data.msg;
  list.data = [];
  list.error = 0;
  list.success = 0;
  data.data.forEach(function(v,i){
    var a = {};
    a.id       =  v.question_id;//题目ID
    a.isAnswer =  2; //题目状态 0:未做，1：正确，2：错误
    a.isNoFirst = (isNewExam && !!a.isAnswer);//当前题是否已答
    a.isStore =  v.is_store || false; //题目是否收藏
    if(a.isAnswer == 1){//对题
      list.success++;
    }else if(a.isAnswer == 2){//错题
      list.error++;
    }
    list.data.push(a);
  });
  return list;
}

function fetchApi (type, params,method) {
  return Q.Promise(function(resolve, reject, notify) {
    wx.request({
      url: API_URL + '/' + type,
      data: params,
      header: { 'Content-Type': 'application/json' },
      method:method,
      success:resolve,
      fail: reject
    })
  })
}

module.exports = {
  //获得数据
  find (type,params,isNewExam) {
    return fetchApi(type,params,'GET')
      .then(res => preProcessData(res.data,isNewExam));
  },
  //获得题号
  initialize(type,params,isNewExam){
    params = Object.assign({ 
      subject   :  'kemu3',//科目类别 科1:kemu1,科目4:kemu3
      type      :  'dclx' ,//题目分类
      city      :  '杭州' ,//城市汉字名
      chapterID :   '1'      //章节ID
    },params);
    return fetchApi(type,params,'GET')
      .then(res => preProcessInitData(res.data,isNewExam));  
  },
  //设置收藏
  setStore(type,params){
    return fetchApi(type,params,'GET');
  },
  //设置答案
  setAnswer(type,params){
    return fetchApi(type,params,'GET');    
  }

}


// class Douban {
//   // 不支持
//   // static API_URL = 'https://api.douban.com/v2/movie/'

//   constructor (title, movies) {
//     this.title = title
//     this.movies = movies
//   }
// }
