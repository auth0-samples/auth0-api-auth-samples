using System;

namespace Api.Model
{
    public class Appointment
    {
        public DateTime Date { get; set; }

        public string Subject { get; set; }

        public Appointment(DateTime date, string subject)
        {
            Date = date;
            Subject = subject;
        }
    }
}