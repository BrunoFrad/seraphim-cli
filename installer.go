package main

import(
    "embed"
    "fmt"
    "io/fs"
    "os"
    "path/filepath"
) 

//go:embed app/*
var arquivosJogo embed.FS

const nomePastaDestino  = "Doom"


func main(){

    caminhoInstalacao := filepath.Join(os.Getenv("ProgramFiles"), nomePastaDestino)

    err := extrairPastas("app", caminhoInstalacao)

    if err != nil {
        fmt.Printf("falha em extrair: %v\n", err)
        return
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
