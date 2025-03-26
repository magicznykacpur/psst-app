import { electronApi } from "./preload"

const information = document.getElementById("info")
information.innerText = "HABIDI"
// information.innerText = `This app is using chrome (v${electronApi.versions.chrome()})`