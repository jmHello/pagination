/**
 * Created by jm on 2017/5/5.
 */
/*
* CustormEvent
* */
(function ($) {
    $.CustormEvent=function () {
        this.clientList={};//缓存列表
    };
    var fn=$.CustormEvent.prototype;
    //发布消息
    fn.trigger=function () {
        var key=Array.prototype.shift.call(arguments),//取出消息类型
            fns=this.clientList[key];// 取出该消息对应的回调函数集合
        if(!fns||fns.length==0) return false;//如果没有订阅该消息，则返回
        for(var i=0,fn;fn=fns[i++];) fn.apply(this,arguments); //执行缓存列表中的函数（ arguments 是发布消息时附送的参数）
    };
    //订阅消息
    fn.listen=function (key,fn) {
        if(!this.clientList[key])this.clientList[key]=[];//如果还没有订阅过此类消息，给该类消息创建一个缓存列表
        this.clientList[key].push(fn);// 订阅的消息添加进消息缓存列表
    };
    //删除消息
    fn.remove=function (key,fn) {
        var fns=this.clientList[key];
        if(!fns) return false; // 如果 key 对应的消息没有被人订阅，则直接返回
        if(!fn) fn&&(fns.length=0); // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
        else{
            for(var l=fns.length,_fn;l--;){ // 反向遍历订阅的回调函数列表
                _fn=fns[l];
                if(_fn===fn) fns.splice(l,1); // 删除订阅者的回调函数
            }
        }
    }
})(window.JM.component);

/**
 * Pagination
 */
(function ($) {
    $.Pagination=function (outer,data) {
        this.outer=outer;
        this.pageList=data.pageList||[10,20,30];//每页显示的数据
        this.pageSize=data.pageSize||0;//一页显示的数据——请求时的字段
        this.pageCount=data.pageCount||1;//页面总数
        this.beginPageIndex=data.beginPageIndex||1;//首页
        this.currentPage=data.currentPage||1;//当前页
        this.endPageIndex=data.endPageIndex||1;//尾页
        this.recordCount=data.recordCount||0;//数据总数
        this.recordList=data.recordList||[];//数据
        this.beginPageBtn=null;//首页按钮
        this.endPageBtn=null;//尾页按钮
        this.lastIndexBtn=null;//上一页按钮
        this.nextIndexPage=null;//下一页按钮
        this.currentPageNum=null;//当前页
        this.totalRecords=null;//总数
        this.pageSizeChoice=null;//每页显示数据的选择
        this.pageCurrentChoiceBtn=null;//选择当前页的按钮
        this.pageSizeBtn=null;//选择每页展示数据数的按钮
        this.cE=new JM.component.CustormEvent();//订阅-分布模式的对象
    };
    var getIndex=function (eles,input,callback) {
        for(var i=0,len=eles.length;i<len;i++){
            eles[i].onclick=function () {
                input.value=this.innerHTML;
                callback&&callback.call(this, input.value);
            }
        }
        // JM.reverseIterator(eles,function (i,item) {
        //     JM.addHandler(item,'click',function (e) {
        //         JM.stopPropagation(JM.getEvent(e));
        //         input.value=this.innerHTML;
        //         callback&&callback.call(item, input.value);
        //     },false);
        // })
    };
    var fn=$.Pagination.prototype;
    //创建分页插件的基本架构
    fn.createStructure=function () {
        this.outer.innerHTML='<div> ' +
            '<div class="clearfix"> ' +
            '<p>共<i class="page_total">0</i>条记录，当前页为第<strong class="page_current">1</strong>页</p> ' +
            '<ul class="page_ranging clearfix"> ' +
            '<li><a href="javascript:;" class="begin_page">首页</a></li> ' +
            '<li><a href="javascript:;" class="last_page">上一页</a></li> ' +
            '<li class="p_choice_style"><div><input type="button" value="1"><ul class="page_currentChoice"></ul></div><small>/页</small></li> ' +
            '<li><a href="javascript:;" class="next_page">下一页</a></li> ' +
            '<li><a href="javascript:;" class="end_page">尾页</a></li> ' +
            '<li class="p_choice_style"><small>每页显示条数</small><div><input type="button" value="10"><ul class="page_size"></ul></div><small>条</small></li> ' +
            '</ul> ' +
            '</div> ' +
            '</div>';
        //获取元素
        this.beginPageBtn=this.outer.querySelector('.begin_page');
        this.endPageBtn=this.outer.querySelector('.end_page');
        this.lastIndexBtn=this.outer.querySelector('.last_page');
        this.nextIndexPage=this.outer.querySelector('.next_page');
        this.currentPageNum=this.outer.querySelector('.page_current');
        this.totalRecords=this.outer.querySelector('.page_total');
        this.pageCurrentChoice=this.outer.querySelector('.page_currentChoice');
        this.pageSizeChoice=this.outer.querySelector('.page_size');
        this.pageCurrentChoiceBtn=this.outer.querySelectorAll('.p_choice_style input[type="button"]')[0];
        this.pageSizeBtn=this.outer.querySelectorAll('.p_choice_style input[type="button"]')[1];
    };
    //创建当前页的下拉框的架构
    fn.createCurrentPageList=function () {
        var html='';
        for(var i=1,len=this.endPageIndex;i<=len;i++){
            html+='<li><small>'+i+'</small></li>';
        }
        this.pageCurrentChoice.innerHTML=html;
    };
    //创建每页展示数据数的下拉框的架构
    fn.createPageList=function () {
        var html='';
        for(var i=0,len=this.pageList.length;i<len;i++){
            html+='<li><small>'+this.pageList[i]+'</small></li>';
        }
        this.pageSizeChoice.innerHTML=html;
    };
    //获取当前页
    fn.getCurrentPage=function () {
        var _self=this;
        this.createCurrentPageList();
        JM.addHandler(this.pageCurrentChoiceBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            JM.addClass(_self.pageCurrentChoice,'show');
            var sm=_self.pageCurrentChoice.querySelectorAll('small');
            getIndex(sm,this,function (pN) {
                _self.currentPage=pN;
                _self.currentPageNum.innerHTML=pN;
                JM.removeClass(this.parentNode.parentNode,'show');
                _self.cE.trigger('updateMsg');//订阅消息
            });
        },false);
    };
    //获取每页显示数据数
    fn.getPageList=function () {
        var _self=this;
        this.createPageList();
        JM.addHandler(this.pageSizeBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            JM.addClass(_self.pageSizeChoice,'show');
            var sm=_self.pageSizeChoice.querySelectorAll('small');
            getIndex(sm,this,function (size) {
                _self.pageSize=size;
                JM.removeClass(this.parentNode.parentNode,'show');
                _self.change();
                _self.getCurrentPage();
                _self.currentPageNum.innerHTML=1;
                _self.pageCurrentChoiceBtn.value=1;
                _self.cE.trigger('updateMsg');//订阅消息
            });
        },false);
    };
    //获取上一页的数据
    fn.getPrev=function () {
        var _self=this;
        JM.addHandler(this.lastIndexBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            //当前页>首页，则可以继续获取上一页的数据，否则仍然是首页的数据
            if(--_self.currentPage<_self.beginPageIndex){
                _self.currentPage=_self.beginPageIndex;
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }else{
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }
            _self.cE.trigger('updateMsg');//订阅消息
        },false);
    };
    //获取下一页的数据
    fn.getNext=function () {
        var _self=this;
        JM.addHandler(this.nextIndexPage,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            //如果当前页<尾页，则可继续获取下一页的数据，否则仍然是尾页的数据
            if(++_self.currentPage>_self.endPageIndex){
                _self.currentPage=_self.endPageIndex;
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }else{
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }
            _self.cE.trigger('updateMsg');
        },false);
    };
    //获取首页的数据
    fn.getFirst=function () {
        var _self=this;
        JM.addHandler(this.beginPageBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            _self.currentPage=_self.beginPageIndex;
            _self.currentPageNum.innerHTML=_self.currentPage;
            _self.pageCurrentChoiceBtn.value=_self.currentPage;
            _self.cE.trigger('updateMsg');//订阅消息
        },false);
    };
    //获取尾页数据
    fn.getEnd=function () {
        var _self=this;
        JM.addHandler(this.endPageBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            _self.currentPage=_self.endPageIndex;
            _self.currentPageNum.innerHTML=_self.currentPage;
            _self.pageCurrentChoiceBtn.value=_self.currentPage;
            _self.cE.trigger('updateMsg');//订阅消息
        },false);
    };
    //计算数据
    fn.change=function () {
        var _len=this.recordCount;
        if(_len){
            this.endPageIndex=Math.ceil(_len/this.pageSize);
        }else this.endPageIndex=1;
        this.getCurrentPage();
    };
    //更新数据——也是对外获取数据的接口
    fn.updateMsg=function (fn) {
       var self=this;
       var msg=(function () {
           var _self=self;
           return function () {
               fn.call(_self,function (result) {
                   console.log(result,result.pageCount,result.recordCount);
                   _self.pageList=result.pageList|| _self.pageList;
                   _self.pageSize=result.pageSize|| _self.pageSize;
                   _self.pageCount=result.pageCount|| _self.pageCount;
                   _self.beginPageIndex=result.beginPageIndex|| _self.beginPageIndex;
                   _self.currentPage=result.currentPage|| _self.currentPage;
                   _self.endPageIndex=result.endPageIndex|| _self.endPageIndex;
                   _self.recordCount=result.recordCount|| _self.recordCount;
                   _self.recordList=result.resultList|| _self.recordList;
                   _self.totalRecords.innerHTML=_self.recordCount;
                   _self.change();
               },{
                   'currentPage':parseInt(_self.pageCurrentChoiceBtn.value),
                   'pageSize':parseInt(_self.pageSizeBtn.value)
               });
           };
       })();
       this.cE.listen('updateMsg',msg);//订阅消息
   };
   //分页插件初始化
    fn.init=function () {
       this.createStructure();
       this.getCurrentPage();
       this.getPageList();
       this.getPrev();
       this.getNext();
       this.getFirst();
       this.getEnd();
       this.cE.trigger('updateMsg');//发布消息
   };

   // if(JM.getEle('[jm-Pagination]')){
   //     var a=JM.getEle('[jm-Pagination]');
   //     var b=new $.Pagination(a,{});
   //     var d={
   //         'recordList':[1,2,3,4,5,6,7,8,10,11]
   //     };
   //     b.updateMsg(function (handle,data) {
   //          console.log(data);
   //     });
   //     b.init();
   // }
})(window.JM.component);