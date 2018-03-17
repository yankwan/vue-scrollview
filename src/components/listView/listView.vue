<template>
    <div class="wrapper" ref="wrapper">
        <ul>
            <li class="list-group" v-for="group in userList" :key="group.title" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li class="list-group-item" v-for="(item, index) in group.items" :key="index">
                        <img class="avatar" src="../../assets/image/logo.png">
                        <div class="item-info">
                            <span class="name">{{item.username}}</span>
                            <span class="email">Email: {{item.email}}</span>
                            <span class="website">Phone: {{item.website}}</span>
                        </div>
                        
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" 
            @touchstart.stop.prevent="onShortcutTouchStart"
            @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li class="item" 
                    :class="{'current': currentIndex === index}" 
                    v-for="(group, index) in userList"
                    :key="group.title"
                    :data-index="index">{{group.title}}</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { getUsers, getMockUsers } from "api/listView";
import BScroll from "better-scroll";
import { handleDomData } from 'util/domUtil';

const ANCHOR_HEIGHT = 18;

export default {
    data() {
        return {
            userList: [],
            currentIndex: 0,
            scrollY: 0
        }
    },
    created() {
        // 记录每次touch的相关信息
        this.touch = {};
        this.listHeight = [];
        this._getUsers().then(data => {
            // data()函数中定义的数据
            // this.userList 在获得数据后，会触发页面刷新
            this.userList = data;
            this._initScroll();
        })
    },
    mounted() {
        // 因为是异步获取数据，此时数据还未取回
        // created() 阶段只是将 this.userList 空数组设为响应式了，实际上数据还在取回途中
        // 所以与 userList 数据相关的 dom 操作可以放在 对 userList 的watch中
        console.log(this.userList);
    },
    methods: {
        onShortcutTouchStart(e) {
            let anchorIndex = handleDomData(e.target, 'index');
            let touch = e.touches[0];
            this.touch.y1 = touch.pageY;
            this.touch.anchorIndex = anchorIndex;
            this.currentIndex = parseInt(anchorIndex);
            this._scrollTo(anchorIndex);
        },
        onShortcutTouchMove(e) {
            let touch = e.touches[0];
            this.touch.y2 = touch.pageY;
            let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
            let anchorIndex = this.currentIndex = parseInt(this.touch.anchorIndex) + delta;
            this._scrollTo(anchorIndex);
        },
        _initScroll() {
            this.$nextTick(() => {
                this.scroll = new BScroll(this.$refs.wrapper, {
                    // probeType=1, 2, 3分别对应不同的scroll事件派发处理
                    probeType: 3,
                    click: true
                });
                this.scroll.on('scroll', (pos) => {
                    this.scrollY = pos.y;
                })
            })
        },
        _scrollTo(index) {
            this.scroll.scrollToElement(this.$refs.listGroup[index], 0);
        },
        async _getUsers() {
            const users = await getMockUsers(); //await getUsers();
            let map = {}
            users.forEach((item, index) => {
                const key = item.username.slice(0, 1);
                if (!map[key]) {
                    map[key] = {
                        title: key,
                        items: []
                    }
                }
                // 构造多条数据
                for (let i = 0; i < 1; i++) {
                    map[key].items.push(item);
                }

                if (key === 'S') {
                    for (let i = 0; i < 4; i++) {
                        map[key].items.push(item);
                    }
                }

            })

            let res = [];
            for (let key in map) {
                res.push(map[key]);
            }
            res.sort((a, b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0);
            })

            return res;
        },
        _calculateHeight() {
            this.listHeight = [];
            const list = this.$refs.listGroup;
            let height = 0;
            this.listHeight.push(height);
            for (let i = 0; i < list.length; i++) {
                height += list[i].clientHeight;
                this.listHeight.push(height);
            }
        }
    },
    watch: {
        userList() {
            this.$nextTick(() => {
                this._calculateHeight();
            })
        },
        scrollY(newY) {
            const listHeight = this.listHeight;
            // 顶部有空白位置了，滚到顶部了
            if (newY > 0) {
                this.currentIndex = 0;
                return;
            }
            // 中部滚动
            for (let i = 0; i < listHeight.length - 1; i++) {
                let height1 = listHeight[i];
                let height2 = listHeight[i + 1];
                if (-newY >= height1 && -newY < height2) {
                    this.currentIndex = i;
                    return;
                }
            }

            // 超过底部再继续滚动
            // 即 -newY >= height2
            this.currentIndex = listHeight.length - 2;
        }
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    position: fixed;
    width: 100%;
    height: 100%;

    .list-group {
        text-align: left;

        .list-group-title {
            padding: 5px;
            padding-left: 10px;
            background-color: lightblue;
        }
        .list-group-item {
            display: flex;
            align-items: center;
            padding: 5px;
            border-bottom: 1px solid lightgray;
            .avatar {
                width: 40px;
                height: 40px;
                margin-left: 10px;
            }
            .item-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                margin-left: 20px;
                .name, .email, .website {
                    line-height: 1em;
                    height: 1em;
                    padding: 5px;
                }
                .name {
                    font-size: 1.2em;
                    font-weight: bold;
                }
            }
        }
    }
    .list-shortcut {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 50;
        margin-right: 5px;
        width: 20px;
        background-color: lightgray;
        border-radius: 10px;
        text-align: center;
        .item {
            padding: 3px;
            height: 18px;
            &.current {
                color: deepskyblue;
                font-size: 1.2em;
            }
        }

    }
}

</style>

