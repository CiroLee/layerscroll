//参数配置
const SETTINGS = {
    thumbs:'scene',
    // thumbs2:[
    //     {title:'第一个',thumburl:'skin/aodi_a3.jpg',scene:'scene_MonValley_G_DirtRoad_8k'},
    //     {title:'第er个',thumburl:'skin/3d_carmat.jpg',scene:'scene_MonValley_G_DirtRoad_8k'},
    // ],
    container:{
        width:'94%',
        height:80,
        bgalpha:0.8,
        y:50,
        bgcolor:'0x000000'
    },
    thumbsets:{
        width:70,
        spacing:10,
        thumbCSS:'font-family:Arial; font-size:14px; color:#fff;text-align:center;line-height:15px'
    }
}
class layerScroll extends Pano {
    constructor(pano){
        super(pano);
    }
    
    //主方法，创建菜单
    create(name){
        //console.log(this._thumbs())
        let thumbarray = this._thumbs();
        //父层
        this._createContainer(name);
        //滚动层
        let scrollname = this._craeteScrollArea(name,thumbarray.length);
        //缩略图层
        thumbarray.map((element,index)=>{
            this._createThumbLayer(scrollname,element,index)
        });

        return scrollname;
    }
    //重置滚动层位置
    scrollAreaResize(scrollname){
        let scrollwidth = this.getlayer({
            name:scrollname,
            list:['width']
        }).width;
        if(scrollwidth < document.body.clientWidth){
            this.setlayer({
                name:scrollname,
                list:{
                    align:'center'
                }
            });
        }
        else{
            this.setlayer({
                name:scrollname,
                list:{
                    align:'left'
                }
            });
        }
    }
    //缩略图点击事件
    _thumbClickEvent(index){
        if(SETTINGS.thumbs == 'scene'){
            this.loadscene(index);
        }
        else if(this._getType(SETTINGS.thumbs) == 'array'){
            this.loadscene(SETTINGS.thumbs[index].scene)
        }
        
        let count = this.get('layer.count'),
            elementsArray = new Array();
        for(let i=0;i < count; i++){
            let element = this.get(`layer[${i}]`);
            elementsArray.push(element);
        };
        let newElements = elementsArray.filter(element=>element.active);
        newElements.map(element=>{
            if(element.thumbindex == index){
                this.setlayer({
                    name:element.name,
                    list:{bgalpha:1}
                });
            }
            else{
                this.setlayer({
                    name:element.name,
                    list:{bgalpha:0}
                });
            }
        });
        
    }
    //缩略图数组判定
    _thumbs(){
        let thumbs = new Array();
        if(SETTINGS.thumbs == 'scene'){
            let count = this.get('scene.count');
            for(let i = 0; i < count;i++){
                let _title = `scene[${i}].title`,
                    _thumburl = `scene[${i}].thumburl`;
                let item = {
                    title:this.get(_title),
                    thumburl:this.get(_thumburl)
                };
                thumbs.push(item);
            }
        }
        else if(this._getType(SETTINGS.thumbs) == 'array'){
            thumbs = SETTINGS.thumbs;
        }
        return thumbs;
    }

    //创建父层
    _createContainer(name){
        this.createlayer({
            name:name,
            list:{
                type:'container',
                keep:true,
                width:SETTINGS.container.width,
                height:SETTINGS.container.height,
                bgalpha:SETTINGS.container.bgalpha,
                bgcolor:SETTINGS.container.bgcolor,
                align:'bottom',
                y:SETTINGS.container.y
            }
        });
    }
    
    //创建滚动层
    _craeteScrollArea(name,nums){
        let scrollname = `scroll_${name}`;
        this.createlayer({
            name:scrollname,
            list:{
                parent:name,
                url:'%SWFPATH%/plugins/scrollarea.js',
                keep:true,
                align:'left',
                width:nums * SETTINGS.thumbsets.width + (nums + 1) * SETTINGS.thumbsets.spacing,
                height:'100%',
                direction:'h',
                isscroll:true
            }
        });

       return scrollname;
    }
    //创建缩略图层：图片层、文字层、激活层,name参数为滚动层name
    _createThumbLayer(name,element,index){
        let parent = this.__thumbParent(name,element,index);
        this.__thumbPic(parent,element,index);
        this.__textlayer(parent,element,index);
        this.__activelayer(parent,element,index);
    }
    //子函数(私有)--创建缩略图父层
    __thumbParent(name,element,index){
        let thumbparent = `thumbparent_${name}_${index}`;
        this.createlayer({
            name:thumbparent,
            list:{
                keep:true,
                parent:name,
                type:'container',
                align:'left',
                edge:'center',
                width:SETTINGS.thumbsets.width,
                height:SETTINGS.thumbsets.width,
                maskchildren:true
            }
        });
        //位置计算
        if(index == 0){
            this.setlayer({
                name:thumbparent,
                list:{x:0.5 * SETTINGS.thumbsets.width + SETTINGS.thumbsets.spacing}
            });
        }
        else{
            this.setlayer({
                name:thumbparent,
                list:{x:index * SETTINGS.thumbsets.width + (0.5) * SETTINGS.thumbsets.width + (index + 1) * SETTINGS.thumbsets.spacing}
            });
        }
        
        return thumbparent;
    }
    //创建缩略图图片层
    __thumbPic(name,element,index){
        this.createlayer({
            name:`thumbpic_${name}`,
            list:{
                parent:name,
                keep:true,
                width:'94%',
                height:'94%',
                url:element.thumburl,
                align:'center',
                onclick:()=>{LS._thumbClickEvent(index)}
            }
        });   
    }
    //创建文字层
    __textlayer(name,element,index){
        this.createlayer({
            name:`textlayer_${name}`,
            list:{
                parent:name,
                keep:true,
                type:'text',
                width:'94%',
                html:element.title,
                bgalpha:0,
                css:'font-family:Arial; font-size:14px; color:#fff;text-align:center;line-height:15px',
                align:'bottom',
                y:6,
                onclick:()=>{LS._thumbClickEvent(index)}
            }
        });
    }
    //激活层
    __activelayer(name,element,index){
        this.createlayer({
            name:`activelayer_${index}`,
            list:{
                parent:name,
                keep:true,
                type:'container',
                align:'bottom',
                y:0,
                width:'94%',
                height:2,
                bgalpha:0,
                bgcolor:'0xF51414',
                zorder:5,
                thumbindex:index,
                active:true
            }
        });
    }

}


const LS = new layerScroll();

setTimeout(() => {
   let scrollarea = LS.create('layer1');
   LS.scrollAreaResize(scrollarea);
    window.onresize = ()=>{
        LS.scrollAreaResize(scrollarea);
    }
}, 200);
