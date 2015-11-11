namespace Api.Model
{
    public class Contact
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public Contact(string name, string email)
        {
            Name = name;
            Email = email;
        }
    }
}