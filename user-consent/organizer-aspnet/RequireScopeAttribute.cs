using System.Threading.Tasks;
using System.Security.Claims;

using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using System.Web.Http.Controllers;
using System;

namespace Api
{
    public class RequireScopeAttribute : AuthorizationFilterAttribute
    {
        public string Scope { get; set; }

        public RequireScopeAttribute(string scope)
        {
            this.Scope = scope;
        }

        public override Task OnAuthorizationAsync(HttpActionContext actionContext, System.Threading.CancellationToken cancellationToken)
        {
            var principal = actionContext.RequestContext.Principal as ClaimsPrincipal;
            if (!HasScopeClaim(principal, Scope))
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, 
                    new { reason = string.Format("User is missing the {0} scope.", Scope) });
                return Task.FromResult<object>(null);
            }
            
            return Task.FromResult<object>(null);
        }

        private bool HasScopeClaim(ClaimsPrincipal principal, string scope)
        {
            if (principal == null || !principal.Identity.IsAuthenticated)
            {
                return false;
            }

            var claim = principal.FindFirst(c => c.Type == "scope");
            return claim != null && !String.IsNullOrEmpty(claim.Value) && 
                    (claim.Value == scope || (claim.Value.Contains(" ") && claim.Value.Split(' ').Any(s => s == scope)));
        }
    }
}