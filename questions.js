// Đáp án đúng luôn ở vị trí đầu tiên trong "a"; server sẽ xáo trộn khi tạo ván.
const VN = [
  {q:"Sông Cửu Long là tên gọi của đoạn hạ lưu của con sông nào?", a:["Sông Mê Công","Sông Hồng","Sông Đồng Nai","Sông Mã"]},
  {q:"Hang Sơn Đoòng, một trong những hang động lớn nhất thế giới, nằm trong vườn quốc gia nào?", a:["Phong Nha – Kẻ Bàng","Cúc Phương","Cát Tiên","Bạch Mã"]},
  {q:"Tác phẩm “Truyện Kiều” do ai sáng tác?", a:["Nguyễn Du","Nguyễn Trãi","Hồ Xuân Hương","Nguyễn Đình Chiểu"]},
  {q:"Đồng bằng lớn nhất Việt Nam là?", a:["Đồng bằng sông Cửu Long","Đồng bằng sông Hồng","Đồng bằng Thanh Hóa","Đồng bằng Phú Yên"]},
  {q:"Đảo lớn nhất của Việt Nam là?", a:["Phú Quốc","Cát Bà","Côn Đảo","Lý Sơn"]},
  {q:"Chùa Một Cột (chùa Diên Hựu) nổi tiếng nằm ở thành phố nào?", a:["Hà Nội","Huế","Hải Phòng","Đà Nẵng"]},
  {q:"Ngày Quốc khánh của Việt Nam là ngày nào?", a:["2/9","30/4","19/5","27/7"]},
  {q:"Giỗ Tổ Hùng Vương được tổ chức vào ngày nào âm lịch?", a:["10/3","15/1","5/5","15/8"]},
  {q:"Dãy núi nào dài nhất Việt Nam?", a:["Trường Sơn","Hoàng Liên Sơn","Con Voi","Pu Đen Đinh"]},
  {q:"Món bún chả nổi tiếng gắn liền với thành phố nào?", a:["Hà Nội","Huế","Đà Nẵng","TP. Hồ Chí Minh"]}
];
const WORLD = [
  {q:"Hành tinh nào lớn nhất Hệ Mặt Trời?", a:["Sao Mộc","Sao Thổ","Sao Hải Vương","Trái Đất"]},
  {q:"Con sông dài nhất châu Phi là?", a:["Sông Nile","Sông Congo","Sông Niger","Sông Zambezi"]},
  {q:"Thế vận hội Mùa hè 2024 được tổ chức tại thành phố nào?", a:["Paris","Tokyo","Los Angeles","London"]},
  {q:"Quốc gia nào có diện tích lớn nhất thế giới?", a:["Nga","Canada","Trung Quốc","Mỹ"]},
  {q:"Kim tự tháp Giza nổi tiếng nằm ở quốc gia nào?", a:["Ai Cập","Mexico","Sudan","Jordan"]},
  {q:"Ký hiệu hóa học “Au” là của nguyên tố nào?", a:["Vàng","Bạc","Nhôm","Đồng"]},
  {q:"Đội tuyển nào vô địch FIFA World Cup 2022?", a:["Argentina","Pháp","Brazil","Croatia"]},
  {q:"Sa mạc nóng lớn nhất thế giới là?", a:["Sahara","Gobi","Kalahari","Ả Rập"]},
  {q:"Đại dương nào lớn nhất thế giới?", a:["Thái Bình Dương","Đại Tây Dương","Ấn Độ Dương","Bắc Băng Dương"]}
];
const FINAL = [
  {q:"Vua Quang Trung đại phá quân Thanh vào mùa xuân năm nào?", a:["1789","1788","1802","1771"]},
  {q:"Việt Nam trở thành thành viên chính thức của ASEAN vào năm nào?", a:["1995","1989","1998","2007"]},
  {q:"Vua Lý Thái Tổ dời đô từ Hoa Lư ra Thăng Long vào năm nào?", a:["1010","938","1054","1428"]},
  {q:"Vịnh Hạ Long được UNESCO công nhận là Di sản thiên nhiên thế giới lần đầu vào năm nào?", a:["1994","1993","2000","2003"]},
  {q:"Đỉnh Fansipan, “nóc nhà Đông Dương”, cao khoảng bao nhiêu mét?", a:["3.143 m","2.711 m","3.429 m","2.456 m"]},
  {q:"Nhà Nguyễn, triều đại phong kiến cuối cùng của Việt Nam, được thành lập năm nào?", a:["1802","1428","1009","1884"]},
  {q:"Thủ đô của Úc là thành phố nào?", a:["Canberra","Sydney","Melbourne","Perth"]},
  {q:"Đỉnh Everest nằm trên biên giới giữa Nepal và nước nào?", a:["Trung Quốc","Ấn Độ","Bhutan","Pakistan"]},
  {q:"Chiến thắng Điện Biên Phủ “lừng lẫy năm châu, chấn động địa cầu” diễn ra năm nào?", a:["1954","1945","1968","1975"]}
];
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function prep(item,final){const o=shuffle(item.a.map((t,i)=>({t,c:i===0})));return{q:item.q,opts:o.map(x=>x.t),ci:o.findIndex(x=>x.c),final};}
// 3 câu Việt Nam + 1 câu thế giới (xáo trộn), câu 5 là câu cuối (khó hơn, x2 điểm)
function buildQuestions(){
  const first=shuffle([...shuffle(VN).slice(0,3).map(x=>prep(x,false)),...shuffle(WORLD).slice(0,1).map(x=>prep(x,false))]);
  return [...first,prep(shuffle(FINAL)[0],true)];
}
module.exports={buildQuestions};
