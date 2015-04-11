# node-combo

nodejs的静态合并

## 故事

> [http://www.xuexb.com/html/250.html](http://www.xuexb.com/html/250.html)

由于项目迭代开发,可能一直在改版, 如果使用`grunt`之类的工作进行合并,又有学习成本和维护成本, 但如果不压吧, 感觉B格又不高, 于是想想有没有一种可以在请求的时候去合并,压缩的, 起初看到大搜车的`ads`, 后来知道了美丽说也是这种模式, 于是就想试试用`nodejs`写一个类似这么个东东...然后...

## 介绍

### 普通的合并

这种通常可以满足你的需求了,可以把多个文件进行合并(前提是一个链接只能合并一种文件类型), 比如 `demo.com/??test/a.css,test/b.css`, 也或者 `demo.com/??test/a.js,test/b.js`, 但由于文件路径很长的原因导致整个链接可能很长,很长...

然后就在考虑是不是可以以子目录的方式进行合并?

### 子目录合并

这种可以使你先进入深的目录,再动态的合并文件, 比如 `demo.com/test/test2/test3??a.css,b.css,c.css` ,是不是略爽?

但如果一个链接里我目录既然深, 还会跨目录呢?

### 跨目录合并

先上"比如": `demo.com/test/test2/test3/??a.css,b.css,/biede/c.css`, 这种就可以解决跨目录的问题, 但我在想很反感, 通过`seajs`的`alias`我在考虑链接能不能也"别名", 于是...

### 别名加载

例子

### 加载cmdJS

### 无缓存加载

## demo

### 合并css

* `demo.com/??test/a.css,test/b.css` 普通的合并
* `demo.com/test/??a.css,b.css` 以子目录合并
* `demo.com/test/??a,b?type=css` 添加文件类型,可以替代文件后缀
* `demo.com/??global` 别名方式
* `demo.com/test/??a.css,b.css,/test2/c.css` 跨目录合并
* `demo.com/test/??a.css,b.css?4654` 添加时间缀

### 合并js

**注:js会判断是否为`cmd`,如果是则会添加id并抽取依赖, uri是以子目录为基础来设置**

* `demo.com/??test/a.js,test/b.js` 普通的合并
* `demo.com/test/??a.js,b.js` 以子目录合并
* `demo.com/test/??a,b?type=js` 添加文件类型,可以替代文件后缀,默认`type`为`js`
* `demo.com/test/??a,b` 默认文件类型
* `demo.com/??global` 别名方式

## 请求处理流程

在捕获到页面请求后,经过这些处理:

1. 判断是否有`??`存在,如果没有则认为需要`nginx`等服务器处理
2. 判断`??`后的字符是否为别名(配置的`alias`), 如果有,则拿别名的值替换整个`url`
3. 判断是否开启`cache`, 如果有则使用`md5`的`url`读取缓存文件是否存在,如果存在,则直接输出并中断
4. 对`url`进行分组,生成文件路径数组
5. 遍历路径数组,判断文件是否存在,存在则调用相应的处理文件进行处理
6. 处理文件,如`cmd`的生成
7. 如果开启`cache`则写入缓存
8. 数据输出

## 配置

``` js
{
    base: './',//根路径
    cache: true,//是否开启缓存
    cache_path: './__cache',//缓存目录
    alias: {},//别名
    port: 80,//端口
}
```

## todo

* tpl->js的支持
* css->js的支持
* debug功能
* cache管理
* 压缩开关