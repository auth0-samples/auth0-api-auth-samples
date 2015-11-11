using System.Linq;
using System.Web.Http;
using System.IdentityModel.Tokens;

using Api;

using Owin;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security.ActiveDirectory;
using System.Configuration;

[assembly: OwinStartup(typeof(Startup))]

namespace Api
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var issuer = "https://" + ConfigurationManager.AppSettings["auth0:Domain"] + "/";
            var audience = ConfigurationManager.AppSettings["auth0:ResourceServer"];

            app.UseCors(CorsOptions.AllowAll);
            app.UseActiveDirectoryFederationServicesBearerAuthentication(
                new ActiveDirectoryFederationServicesBearerAuthenticationOptions
                {
                    TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidAudience = audience,
                        ValidIssuer = issuer,
                        IssuerSigningKeyResolver = (token, securityToken, identifier, parameters) => 
                            parameters.IssuerSigningTokens.FirstOrDefault().SecurityKeys.FirstOrDefault()
                    },
                    MetadataEndpoint = string.Format("{0}/wsfed/FederationMetadata/2007-06/FederationMetadata.xml", issuer.TrimEnd('/'))
                });

            var configuration = new HttpConfiguration();
            configuration.MapHttpAttributeRoutes();
            configuration.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
                );
            app.UseWebApi(configuration);
        }
    }
}
