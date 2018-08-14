/**
 * 糅合类
 * @param {rest} mixins 需要糅合的对象
 * @return 返回糅合类Mix
 */
function mix(...mixins){
     class Mix{}

     for(let mixin of mixins){
           copyProperties(Mix,mixin);
           copyProperties(Mix.prototype,mixin.prototype);
     }

     return Mix;
}

/**
 * 复制对象的属性、方法到目标对象
 * @param {Object} target  目标对象
 * @param {Object} source  源对象 
 */
function copyProperties(target,source){
    for(let key of Reflect.ownKeys(source)){
        if(key!=="constructor"&&key!=="prototype"&&key!=="name"){
            let desc=Object.getOwnPropertyDescriptor(source,key);
            Object.defineProperty(target,key,desc);
        }
    }
}

export default mix;