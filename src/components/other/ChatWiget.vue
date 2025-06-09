<template>
    <div class="chat-room">
      <el-card class="chat-card">
        <div class="messages">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{
              'message-sent': message.username === username,
              'message-received': message.username !== username
            }"
          >
            <el-card
              :class="message.username === username ? 'message-sent-card' : 'message-received-card'"
              class="message-card"
              :body-style="{ padding: '10px' }"
            >
              <div class="message-content">
                <span class="username">{{ message.username }}</span>: {{ message.content }}
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
      <div class="message-input-container">
        <el-input
          v-model="newMessage"
          placeholder="发送消息"
          @keyup.enter="sendMessage"
          class="message-input"
          :prefix-icon="Message"
        >
          <template #append>
            <el-button @click="sendMessage" :icon="Send">Send</el-button>
          </template>
        </el-input>
      </div>
    </div>
  </template>
  
  <script>
  import { ElInput, ElButton, ElCard } from 'element-plus';
  import { Message, Send } from '@element-plus/icons-vue';
  
  export default {
    components: {
      ElInput,
      ElButton,
      ElCard
    },
    setup() {
      return {
        Message,
        Send
      };
    },
    props: {
      roomName: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        messages: [], // 存储消息的数组
        newMessage: '', // 新消息的输入绑定
        chatSocket: null, // WebSocket 实例
        username: '' // 当前用户用户名
      };
    },
    mounted() {
      this.connectWebSocket();
      this.username = localStorage.getItem('uno') || 'Anonymous'; // 假设从路由参数获取用户名
    },
    methods: {
      connectWebSocket() {
        this.chatSocket = new WebSocket(
          `ws://localhost:8001/ws/chat/${this.roomName}/`
        );
  
        this.chatSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.messages.push(data);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        };
      },
      sendMessage() {
        if (this.newMessage) {
          this.chatSocket.send(JSON.stringify({
            content: this.newMessage
          }));
          this.newMessage = ''; // 发送后清空输入框
        }
      },
      scrollToBottom() {
        const container = this.$el.querySelector('.messages');
        container.scrollTop = container.scrollHeight;
      }
    },
    beforeUnmount() {
      if (this.chatSocket) {
        this.chatSocket.close(); // 组件销毁时关闭 WebSocket 连接
      }
    }
  };
  </script>
  
  <style scoped>
  .chat-room {
    display: flex;
    flex-direction: column;
    height: 100vh; /* 占满整个视口高度 */
    width: 80%; /* 聊天区域宽度 */
    margin: auto; /* 居中显示 */
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .chat-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background: #f5f7fa;
    border: none; /* 移除内部边框 */
    margin-bottom: 10px;
    max-height: calc(100vh - 150px); /* 留出输入框和卡片边距的空间 */
  }
  
  .message {
    margin-bottom: 10px;
  }
  
  .message-sent {
    text-align: right;
  }
  
  .message-received {
    text-align: left;
  }
  
  .message-sent-card {
    background-color: #00ff00; /* 发送的消息为绿色 */
    color: white;
    max-width: 50%; /* 发送的消息框宽度 */
    margin-left: auto; /* 靠右对齐 */
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .message-received-card {
    background-color: white; /* 接收的消息为白色 */
    max-width: 50%; /* 接收的消息框宽度 */
    margin-right: auto; /* 靠左对齐 */
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .message-card {
    display: inline-block;
    padding: 10px;
    word-wrap: break-word;
  }
  
  .username {
    font-weight: bold;
  }
  
  .message-input-container {
    width: 100%; /* 输入框容器宽度 */
    display: flex;
    justify-content: center; /* 居中显示 */
    background: #ffffff;
    padding: 10px;
    border-top: 1px solid #eaeaea;
  }
  
  .message-input {
    width: 80%; /* 输入框宽度 */
    margin-top: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  </style>