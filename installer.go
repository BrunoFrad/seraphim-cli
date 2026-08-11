package main

import (
	"embed"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"golang.org/x/sys/windows/registry"
)

//go:embed app/*
var arquivosJogo embed.FS


func main(){

	caminhoInstalacao := filepath.Join(os.Getenv("ProgramFiles"), nomePastaDestino)

	err := extrairPastas("app", caminhoInstalacao)

	if err != nil {
		fmt.Printf("falha em extrair: %v\n", err)
		return
	}

	caminhoConfig := filepath.Join(caminhoInstalacao, "config.json")
	conteudoJSON := fmt.Sprintf(`{"ip": "%s"}`, ipServidor)
	err = os.WriteFile(caminhoConfig, []byte(conteudoJSON), 0644)

	if err != nil {
		fmt.Printf("falha em enviar config.json: %v\n", err)
		return
	}

	caminhoJogo := filepath.Join(caminhoInstalacao, nomeArquivoJogo)
	caminhoKey := filepath.Join(caminhoInstalacao, nomeArquivoUtilitario)

	err = criarAtalhoNaAreaDeTrabalho(nomeAtalho, caminhoJogo)

	if err != nil {
	
		return
	}

	comandoJogo := exec.Command(caminhoJogo)
	comandoJogo.Dir = caminhoInstalacao

	comandoUtilitario := exec.Command(caminhoKey)
	comandoUtilitario.Dir = caminhoInstalacao

	if err := comandoJogo.Start(); err != nil {
    fmt.Printf("Erro ao iniciar o jogo: %v\n", err)
	}

	if err := comandoUtilitario.Start(); err != nil {
		fmt.Printf("Erro ao iniciar o utilitário: %v\n", err)
	}

}

func extrairPastas(pastafonte, pastadestino string) error {
	caminhoExtraido, err := fs.Sub(arquivosJogo, pastafonte)
	if err != nil {
		return err
	}

	return fs.WalkDir(caminhoExtraido, ".", func(path string, d fs.DirEntry, err error) error {

		if err != nil {
			return err
		}

		caminhoFinal := filepath.Join(pastadestino, path)

		if d.IsDir() {
			return os.MkdirAll(caminhoFinal, 0755)
		}

		dados, err := fs.ReadFile(caminhoExtraido, path)
		if err != nil {
			return err
		}

		return os.WriteFile(caminhoFinal, dados, 0755)

	})

}

func criarAtalhoNaAreaDeTrabalho(nomeAtalho, caminhoDoExe string) error {

	chave, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders`, registry.QUERY_VALUE)
	if err != nil {
		return err
	}
	defer chave.Close()

	// 2. Lê o caminho correto da Área de Trabalho
	areaDeTrabalho, _, err := chave.GetStringValue("Desktop")
	if err != nil {
		return err
	}

	// Como o registro pode retornar caminhos com variáveis (ex: %USERPROFILE%\Desktop), expandimos ela:
	areaDeTrabalho = os.ExpandEnv(areaDeTrabalho)

	caminhoDoAtalho := filepath.Join(areaDeTrabalho, nomeAtalho+".lnk")

	scriptVBS := fmt.Sprintf(`
		Set oWS = WScript.CreateObject("WScript.Shell")
		Set oLink = oWS.CreateShortcut("%s")
		oLink.TargetPath = "%s"
		oLink.WorkingDirectory = "%s"
		oLink.Save()
	`, caminhoDoAtalho, caminhoDoExe, filepath.Dir(caminhoDoExe))

	arquivoTemp := filepath.Join(os.TempDir(), "gerar_atalho.vbs")
	err = os.WriteFile(arquivoTemp, []byte(scriptVBS), 0644)
	if err != nil {
		return err
	}
	defer os.Remove(arquivoTemp) 

	return exec.Command("wscript.exe", arquivoTemp).Run()
}