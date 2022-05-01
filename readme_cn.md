## 关于这个工程

这个项目是[雀魂](https://game.maj-soul.com/)的一个麻将AI，可以直接在任何浏览器中运行。所有的东西都是用本地的JavaScript从头开始写的，没有调用任何逻辑库。 
这个Ai目前不使用深度学习方式，而是使用传统的算法。简单地说，它可以在模拟一些回合，依据所打出的牌来寻找最佳的行动。 
目前AI支持3麻和4麻模式。  
[Click here for the English readme.](https://github.com/Jimboom7/AlphaJong/blob/master/readme.md)  
[日本語のリードミーはこちら.](https://github.com/Jimboom7/AlphaJong/blob/master/readme_jp.md)  

## 如何启动

* 安装一个可以让你运行用户脚本的浏览器扩展，如 [Tampermonkey](https://www.tampermonkey.net/?locale=zh).油猴插件
* 直接点击构架好的网页文件 [release of this project](https://github.com/Jimboom7/AlphaJong/releases) 并将其安装在你的浏览器扩展中。 (对于油猴插件，你可以在实用工具->从URL安装中输入下载地址).
* 打开 [雀魂](https://mahjongsoul.game.yo-star.com/) (打开之前确定你已经登陆进雀魂).
* 进入任一一个对局里，当对局开始点击"Start Bot"
* 你可以勾选 "Autostart"，让Ai自动启动新的游戏。
* 对局的输出日志将会显示在浏览器控制台 (Ctrl + Shift + J [Chrome] or Ctrl + Shift + K [Firefox])

### 图形界面
![图形界面](https://i.imgur.com/6PnXb3T.png)
你可以非常简单的使用这个Ai
* Start bot: 关闭或者启动AI自动打牌。
* Autostart: 启用自动运行模式。Ai将自动重新加载网站，并在前一个游戏结束后搜索一个新的游戏。需要打的段位可以在旁边的组合框中选择。(目前仅支持到金之间的所有模式)
* Output Field: 简单告诉你目前AI正在准备做什么。
* Hide Gui: 隐藏图形用户界面。你可以通过在键盘上按 "+"来重新显示它。

### 行为思考参数
默认的参数通常是好的。如果你想修改机器人的行为（例如，小屁胡，对对胡，国士无双等等之类），你可以在脚本的顶部改变一些常量。

* Defense Constants: 修改AI对于防守弃胡的数值
* Calls: 修改AI在听牌阶段的修正量（了解日麻的应该都懂听牌的修正量）
* Hand Evaluation Constants: 修改手牌速胡计算方式。影响AI是否选择屁胡或者考虑做个宝牌战士或者役满大哥。
* Strategy Constants: 修改可以针对七对子，国士无双十三幺，立直后听牌数，听牌巡的修改。

## 统计

![1TB%80YVKEQ(IOL@DX1C72C](https://i.imgur.com/i8huL5J.png)

目前这个AI可以上分到雀豪段位，雀豪之后的路需要大家自己调自己整。

![Yakuman](https://i.imgur.com/j6j2f2V.png)
当你数值没毛病的时候，打出个奶奶牌大三元，那是一点问题都没有的。

## 测试

目前测试于AI对于日麻（何切）问题的思考。

## 已知问题

-有时游戏会因为暂离而断开你的连接。这通常发生在窗口被最小化或你切换到另一个标签的时候（只要窗口是在桌面显示活动的，那就算开着网页看电影也没关系的。）。如果发生这种情况，AI将尝试通过重新加载页面来重新连接。

## 免责声明

Ai是违反雀魂的服务条款的。这意味着理论上你可以因为使用这个脚本而被封禁。虽然目前还没有任何被禁止的报告，但你需要知道，这是你自己的风险，我们不对你使用这个AI行为负责。

翻译By:Nifilmjon

## 单词对比

|英文|中文|
|:---|:---|
|tile|牌|
|wall|牌山|
|stack|一摞(上下两张)|
|pin(circles)|饼|
|pinzu|筒子|
|so(bamboo)|索|
|sozu|索子|
|wan(characters)|万|
|wanzu(manzu)|万子|
|jihai(honor)|字牌|
|wind tile|风牌(东南西北)|
|dragon tile|三元牌(白发中)|
|dora|宝牌|
|iipin|一饼|
|ryanpin|二饼|
|sanpin|三饼|
|supin|四饼|
|upin|五饼|
|ropin|六饼|
|chiipin|七饼|
|papin|八饼|
|chupin|九饼|
|iiso|一索|
|ryanso|二索|
|sanso|三索|
|suso|四索|
|uso|五索|
|roso|六索|
|chiiso|七索|
|paso|八索|
|chuso|九索|
|iiwan|一万|
|ryanwan|二万|
|sanwan|三万|
|suwan|四万|
|uwan|五万|
|rowan|六万|
|chiiwan|七万|
|pawan|八万|
|chuwan|九万|
|ton(east)|东风|
|nan(south)|南风|
|sha(west)|西|
|pei(north)|北|
|haku|白|
|hatsu|发|
|chun|中|
|groups(mentsu)|面子|
|meld|组(一个顺子、刻子或杠子)|
|call(meld, naki)|鸣|
|triplets(kotsu)|刻子|
|sequences(shuntsu)|顺子|
|chii|吃|
|pon|碰|
|kan|杠|
|ron|荣|
|yaku|役|
|han|翻|
|yakuman|役满|
|yakuhai|役牌|
|riichi|立直|
|tanyao|断幺九|
|pinfu|平和|
|iipeikou|一盃口|
|sanankou|三暗刻|
|sankantsu|三杠子|
|toitoi|对对和|
|chiitoitsu|七对子|
|sanshoku doukou|三色同刻|
|sanshoku Doujun|三色同顺|
|shousangen|小三元|
|chanta(honchantaiyaochuu)|混全带幺九|
|honrou|混老头|
|ikkitsuukan(pure straight)|一气通贯|
|ryanpeikou|一盃口|
|closed|门清|
|junchan(junchantaiyaochuu)|纯全带幺九|
|honiisou|混一色|
|chiniisou|清一色|
|tenpai|听牌|
|daisangen|大三元|
|suuankou|四暗刻|
|tsuuiisou|字一色|
|ryuuiisou|绿一色|
|chinroutou|清老头|
|shousuushii|小四喜|
|suukantsu|四杠子|
|chuuren poutou|九莲宝灯|
|kokushi musou(thirteen orphans)|国士无双|
|suuankou tanki|四暗刻单骑|
|kokushi musou juusan menmachi|国士无双十三面|
|junsei chuuren poutou|纯正九莲宝灯|
|daisuushii|大四喜|