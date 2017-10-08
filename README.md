# canvas-2048
记得某天群里俩小伙伴上传了2048的代码，实乃新手入门必写demo。应要写了个粒子效果 ~~帅炸~~(渣) 的demo。纯js，然后由于那会儿刚学js没一会儿，代码惨不忍睹。~~好歹勉强跑起来了QAQ~~
## demo地址
https://wengzs.github.io/canvas-2048/new2048.html
## 效果预览
动图：
![Image text](https://github.com/wengzs/canvas-2048/blob/master/information/start.gif)
静态：
![Image text](https://github.com/wengzs/canvas-2048/blob/master/information/gaming.jpeg)
![Image text](https://github.com/wengzs/canvas-2048/blob/master/information/start.png)
## 思路
#### 前置技能要求
js高程canvas部分得看完，看完基本也就会了。<br />
这里只提供一些思路以供萌新参考。如果真想照着我的来一遍练手，代码注释我写的很清楚了，同学们可以慢慢看。<br />
#### 游戏原理
提几个问题：<br />
1、开场动画要做什么样的？<br />
2、怎么初始化数据？<br />
3、当按下 上下左右 键的时候，游戏中的数字应该怎么样动作？<br />
4、怎么判断胜利和失败？<br />
5、怎么在每步之后添加新数字？<br />
6、结束动画是什么？<br />
...<br />
先在脑海里有个印象，知道游戏的具体流程是什么样的。<br />
#### 模块
所以接下来开始写每个模块的功能。建议新手先写出来一个框架，具体功能用console.log('xxxx')代替。<br />
比如这样：
```
window.onload 
||
console.log('入场动画')
||
console.log('数据初始化')
||
console.log('绑定键盘监听事件') ---
||                             |-- 按下了 上 下 左 右
||
console.log('数组变换')
||
console.log('判断胜利条件') ---
                            |-- 胜利动画
                            |-- 失败动画
...
```
就这样大概搭一个框架出来，然后慢慢填坑，慢慢把需要复用的组件给抽象出来。基本就能顺利写完了。
