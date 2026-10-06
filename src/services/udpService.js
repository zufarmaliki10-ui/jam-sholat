import { UdpPlugin } from "capacitor-udp";

export const sendUdpMessage = async (
  message,
  targetIp = "192.168.4.1",
  ports = [8888, 4210, 8080],
) => {
  try {
    // buat socket udp
    const socket = await UdpPlugin.create();
    const socketId = socket.socketId;

    // bind ke port local acak
    await UdpPlugin.bind({ socketId, port: 0 });

    // kirim pesan ke target port
    for (const port of ports) {
      await UdpPlugin.send({
        socketId,
        address: targetIp,
        port: port,
        buffer: btoa(message), //encode teks ke base64
      });
    }

    await UdpPlugin.close({ socketId });
    return true;
  } catch (error) {
    console.error("Gagal mengirim paket UDP:", error);
    return false;
  }
};
