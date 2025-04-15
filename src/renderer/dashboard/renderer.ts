import { Toast } from "bootstrap";

const initDashboardRenderer = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    await getUserToken();
    await getUser();
    await getUsersChats();
    initHeaderDropdownListener();
    initSignoutUser();
    initMessageInputHandler();
  });
};

let userToken: string | undefined = undefined;
const getUserToken = async () => {
  userToken = await window.api.getUserToken();
};

type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
} | null;
let user: User = null;

const getUser = async () => {
  try {
    user = await window.api.requestWithBody(`${window.api_url}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    setUserLoaderHidden();
    setUsername();
  } catch (error) {
    console.log(error);
    promptToast("couldn't retrieve user data");
  }
};

type ChatUser = { id: string; username: string };

type Chat = {
  id: string;
  created_at: string;
  updated_at: string;
  sender: ChatUser;
  receiver: ChatUser;
};

type Message = {
  id: string;
  created_at: string;
  updated_at: string;
  body: string;
  sender_id: string;
  receiver_id: string;
};

let usersChats: Chat[] | [] = [];
let currentChat: Chat | null = null;
let currentMessages: Message[] | [] = [];

const getUsersChats = async () => {
  try {
    const data: Chat[] = await window.api.requestWithBody(
      `${window.api_url}/chats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    usersChats = data;
    currentChat = data[0];

    populateChats(usersChats);

    const messages = await getMessagesForChat(currentChat.id);
    currentMessages = messages;

    populateMessages(currentMessages);
  } catch (error) {
    console.log(error);
    promptToast("couldn't retrieve users chats");
  }
};

const populateChats = (data: Chat[]) => {
  if (data.length > 0) {
    const chats = document.getElementById("chats") as HTMLDivElement;

    data.forEach((chat) => {
      const chatItem = document.createElement("div");
      initChatItemEventListener(chatItem, chat);
      chatItem.classList.add(
        "chat-item",
        "d-flex",
        "justify-content-center",
        "align-items-center"
      );

      const chatWith = document.createElement("div");
      const chatName =
        chat.receiver.id === user?.id
          ? chat.sender.username
          : chat.receiver.username;
      chatWith.classList.add("chat-with");
      chatWith.innerText = chatName;

      chatItem.appendChild(chatWith);
      chats.appendChild(chatItem);
    });
  }
};

const initChatItemEventListener = (chatItem: HTMLDivElement, chat: Chat) => {
  const messages = document.getElementById("messages") as HTMLDivElement;
  messages.innerHTML = "";

  chatItem.addEventListener("click", async () => {
    currentChat = chat;

    try {
      const messages = await getMessagesForChat(chat.id);
      currentMessages = messages;
      populateMessages(currentMessages);
    } catch (error) {
      console.error(error);
      promptToast("couldn't fetch messages for this chat");
    }
  });
};

const getMessagesForChat = async (chatId: string) => {
  const data: Message[] = await window.api.requestWithBody(
    `${window.api_url}/messages/${chatId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return data;
};

const populateMessages = (messages: Message[]) => {
  const messagesEl = document.getElementById("messages") as HTMLDivElement;
  messagesEl.innerHTML = "";

  if (messages.length === 0) {
    const noMessages = document.createElement("div");
    noMessages.classList.add("no-messages", "mt-5");
    noMessages.innerText = "this chat has no messages yet";

    messagesEl.appendChild(noMessages);
    return;
  }

  messages.forEach((message) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add(
      message.sender_id === user?.id ? "my-message" : "receiver-message"
    );
    messageEl.innerText = message.body;

    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
};

const initMessageInputHandler = () => {
  const messageInput = document.getElementById(
    "message-input"
  ) as HTMLTextAreaElement;

  messageInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      try {
        await window.api.requestWithBody(`${window.api_url}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            chat_id: currentChat?.id,
            sender_id: user?.id,
            receiver_id:
              currentChat?.sender.id === user?.id
                ? currentChat?.receiver.id
                : currentChat?.sender.id,
            body: messageInput.value,
          }),
        });

        messageInput.value = "";
      } catch (error) {
        console.log(error);
        promptToast("couldn't send message");
      }
    }
  });
};

const initSignoutUser = () => {
  const signOutButton = document.getElementById("sign-out") as HTMLDivElement;

  signOutButton.addEventListener("click", () => {
    window.api.signOutUser();
  });
};

const setUserLoaderHidden = () => {
  const userLoader = document.getElementById("user-loader") as HTMLDivElement;
  userLoader.classList.add("visually-hidden");
};

const setUsername = () => {
  const userName = document.getElementById("user-name");
  if (userName && user?.username) {
    userName.innerText = user?.username;
  }
};

const initHeaderDropdownListener = () => {
  const headerDropdownButton = document.getElementById(
    "header-dropdown-button"
  ) as HTMLButtonElement;

  headerDropdownButton.addEventListener("click", () => {
    if (headerDropdownButton.classList.contains("show")) {
      toggleHeaderDropdown("hide");
    } else {
      toggleHeaderDropdown("show");
    }
  });

  const dropdownMenu = document.getElementById(
    "header-dropdown-menu"
  ) as HTMLUListElement;
  document.addEventListener("click", (event: MouseEvent) => {
    if ((event.target as HTMLElement).contains(dropdownMenu)) {
      toggleHeaderDropdown("hide");
    }
  });
};

const toggleHeaderDropdown = (toggle: "show" | "hide") => {
  const dropdownButton = document.getElementById(
    "header-dropdown-button"
  ) as HTMLButtonElement;
  const dropdownMenu = document.getElementById(
    "header-dropdown-menu"
  ) as HTMLUListElement;

  if (toggle === "show") {
    dropdownButton.classList.add("show");
    dropdownMenu.classList.add("show");
  } else {
    dropdownButton.classList.remove("show");
    dropdownMenu.classList.remove("show");
  }
};

const promptToast = (message: string) => {
  const toastBody = document.getElementById("dashboard-toast-body");
  if (toastBody) {
    toastBody.innerText = message;
  }

  const toast = document.getElementById("dashboard-toast");
  const toastBootstrap = Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
};

initDashboardRenderer();
