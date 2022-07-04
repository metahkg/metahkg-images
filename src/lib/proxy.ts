import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import dotenv from "dotenv";

dotenv.config();

const httpsAgent = new SocksProxyAgent({
  timeout: 900000,
  hostname: process.env.proxy_host || "metahkg-images-tor",
  port: process.env.proxy_port || 9150,
  ...(process.env.proxy_auth && { auth: process.env.proxy_auth }),
});

const proxied = axios.create({
  ...(!process.env.no_proxy && { httpsAgent }),
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
  },
});

export default proxied;
