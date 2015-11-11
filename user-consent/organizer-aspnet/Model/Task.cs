using System;

namespace Api.Model
{
    public class Task
    {
        public DateTime DueDate { get; set; }

        public string Title { get; set; }

        public Task(DateTime dueDate, string title)
        {
            DueDate = dueDate;
            Title = title;
        }
    }
}