using Api.Model;
using System;
using System.Web.Http;

namespace Api
{
    public class AppointmentsController : ApiController
    {
        [Authorize, RequireScope("appointments")]
        [HttpGet, Route("api/appointments")]
        public IHttpActionResult Get()
        {
            return this.Ok(new []
            {
                new Appointment(new DateTime(2015, 11, 20), "Meet with Fabrikam"),
                new Appointment(new DateTime(2015, 11, 3), "Follow up on deal with Contoso")
            });
        }
    }
}