using Api.Model;

using System;
using System.Web.Http;

namespace Api
{
    public class TasksController : ApiController
    {
        [Authorize, RequireScope("tasks")]
        [HttpGet, Route("api/tasks")]
        public IHttpActionResult Get()
        {
            return this.Ok(new []
            {
                new Task(new DateTime(2015, 12, 5), "Finish blog post")
            });
        }
    }
}