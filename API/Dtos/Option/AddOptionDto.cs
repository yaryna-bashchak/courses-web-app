namespace API.Dtos.Option
{
    public class AddOptionDto
    {
        public int TestId { get; set; }
        public string Text { get; set; } = "";
        public bool isAnswer { get; set; } = false;
    }
}