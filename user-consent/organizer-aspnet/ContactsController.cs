using Api.Model;

using System.Web.Http;

namespace Api
{
    public class ContactsController : ApiController
    {
        [Authorize, RequireScope("contacts")]
        [HttpGet, Route("api/contacts")]
        public IHttpActionResult Get()
        {
            return this.Ok(new []
            {
                new Contact("John Doe", "john.doe@gmail.com"),
                new Contact("Jane Doe", "jane.doe@gmail.com")
            });
        }
    }
}