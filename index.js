// 保存题目

var str = document.getElementsByTagName('html')[0].innerHTML; 

var re = /examId=(\d+)/;
var examId = str.match(re)[1];

var re1 = /(\d+)&method=savePlayTime/;
var postId = str.match(re1)[1];

var re2 = /teachingTaskId=(\d+)/;
var teachingTaskId = str.match(re2)[1];

var re3 = /videoVisitId=(\d+)/;
var videoVisitId = str.match(re3)[1];

var re4 = /videoLength=(\d+)/;
var videoLength = parseInt(str.match(re4)[1]);

var re5 = /共(\d+)集/;
var allVideoNum = parseInt(str.match(re5)[1]); // 获取视频总数

var re6 = /<font color="red">第(\d+)集/;
var currentVideoNum = parseInt(str.match(re6)[1]); // 获取当前视频集数

var i = 1;
saveTi = setInterval(function(){
    if (i <=3) {
        $.ajax({
        async:false,
        type: "POST",
        url: "/student/assignment/manageAssignment.do?" + postId + "&method=saveExercise",
        data: {examId: examId},
        dataType: "json",
        success: function(result) {
            flag = true;
            if(result.status=='ok' || result.status=="invalid"){
            }else{
                $("#exerciseListUL").append("<li><font color=\"#CDCBCC\">&gt;</font>第"+result.index+"题"+"<font color=\"red\" id=\"examStudentExercise"+result.id+"></font></li>");
            }
        },
        error:function(){
            flag = false;
        }
    });
        i++;
    }
    else {
        clearInterval(saveTi);
    }
},500);

var timer;
setTimeout('setTimer()', videoLength * 1000);

function setTimer() {
    timer = setInterval('saveTimePost()', 500);
}

// 第一次打开，第一集可直接刷完
setTimer();

var playTime = 200;

function saveTimePost() {
    ajaxPost();
    playTime += 200;

    if(playTime > videoLength) {
        clearInterval(timer);
        playTime = videoLength - 1;
        ajaxPost();
    }
}

function ajaxPost() {
    $.ajax({
        async:true,
        type: "POST",
        url: "/student/savePlayTime.do?" + postId + "&method=savePlayTime",
        data: "teachingTaskId=" + teachingTaskId + "&videoVisitId=" + videoVisitId + "&videoLength=" + videoLength + "&playTime=" + playTime,
        success: function(result) {
            if (result=="complete" || (result=="invalid" && true)) {
                if(result == "complete") {
                    if(allVideoNum == currentVideoNum) {
                        alert("本课程视频刷课结束");
                    }
                    console.log('第' + currentVideoNum + '集刷课完成');
                    window.location.reload();
                }

                if(result == "invalid") {
                    console.log('第' + currentVideoNum + '集刷课失败，请稍后');
                    clearInterval(timer);
                    playTime = 200;
                    if(infoTime < 300) {
                        // 失败时重新提交保存时间，
                        setTimer();
                    }
                    
                }
            } else if (result == "ok") {
                lastSaveTime = playTime;
            }
        },
        error:function(){
            console.log('error');
        }
    });
}

console.log('正在刷第' + currentVideoNum + '集');
var infoTime = videoLength;
console.log("第" + currentVideoNum + "集剩余时间为" + infoTime + "s");
$('#unSaveExerciseListUL').append('<h3 id="showTime">本集刷完还需约' + infoTime +'s</h3>')

function info() {
    infoTime--;
    if(infoTime % 50 == 0) {
        console.log("第" + currentVideoNum + "集剩余时间为" + infoTime + "s");
    }
    $("#showTime").text('本集刷完还需约' + infoTime +'s');

    if(infoTime == 0) {
        clearInterval(infoTimer);
    }
}

var infoTimer = setInterval("info()", 1000);
