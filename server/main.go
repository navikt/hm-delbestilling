package main

import (
	"os"

	"github.com/navikt/hotbff"
	"github.com/navikt/hotbff/decorator"
	"github.com/navikt/hotbff/proxy"
	"github.com/navikt/hotbff/texas"
)

var (
	useMSW             = os.Getenv("USE_MSW") == "true"
	idp                = texas.IDPorten
	logoutWarning bool = true
)

func init() {
	if useMSW {
		idp = ""
	}
}

func main() {
	opts := &hotbff.Options{
		BasePath: "/hjelpemidler/delbestilling/",
		RootDir:  "dist",
		DecoratorOpts: &decorator.Options{
			Context:       "samarbeidspartner",
			LogoutWarning: &logoutWarning,
		},
		Proxy: proxy.Map{
			"/api/": &proxy.Options{
				Target:      os.Getenv("API_URL"),
				StripPrefix: false,
				IDP:         texas.TokenX,
				IDPTarget:   os.Getenv("DELBESTILLING_API_AUDIENCE"),
			},
			"/roller-api/": &proxy.Options{
				Target:      os.Getenv("ROLLER_URL"),
				StripPrefix: true,
				IDP:         texas.TokenX,
				IDPTarget:   os.Getenv("ROLLER_AUDIENCE"),
			},
		},
		IDP:     idp,
		EnvKeys: []string{},
	}
	hotbff.Start(opts)
}
