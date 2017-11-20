$(function() {
  var offsetCount = 0;
      commentsToLoad = 5;
      userId = 1;

  getComments(offsetCount, commentsToLoad, false);

  $('body').on('click', '.js-edit-comment', function(e) {
    var $textarea = $(this).parent().siblings('.js-edit-comment-area').find('.js-comment-textarea'),
        commentText = $(this).parent().siblings('.js-comment-content').text();

    $('.js-edit-comment-area').attr('data-edit', 0).hide();
    $('.js-comment-textarea').val('');

    $(this).parent().siblings('.js-edit-comment-area').attr('data-edit', 1).show();
    $textarea.val(commentText);
  });

  $('body').on('click', '.js-reply-comment', function(e) {
    $('.js-edit-comment-area').attr('data-reply', 0).hide();
    $('.js-comment-textarea').val('');

    $(this).parent().siblings('.js-edit-comment-area').attr('data-reply', 1).show();
  });

  $('body').on('click', '.js-delete-comment', function(e) {
    var actionData = {
          _method: 'DELETE'
        };

    var commentId = $(this).closest('.comment-child').length ? $(this).closest('.comment-child').data('comment-id')
                                                            : $(this).closest('.comment').data('comment-id');

    $.ajax({
      url: 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments/' + commentId,
      type: 'POST',
      dateType: 'json',
      data: actionData,
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        offsetCount = 0;
        getComments(offsetCount, commentsToLoad, true);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
      }
    });
  });

  $('body').on('click', '.js-cancel-comment', function(e) {
    $(this).closest('.js-edit-comment-area').attr('data-edit', 0).hide();
  });

  $('body').on('click', '.js-submit-comment', function(e) {
    var $textarea = $(this).siblings('.js-comment-textarea'),
        textareaContent = $textarea.val();
        actionData = {
          content: textareaContent
        },
        commentId = null;

    if($textarea.parent().data('edit') == 1) {
      actionData._method = 'PUT';
      commentId =$(this).closest('.comment-child').length ? $(this).closest('.comment-child').data('comment-id')
                                                        : $(this).closest('.comment').data('comment-id');
    }
    
    if($textarea.parent().data('reply') == 1) {
      actionData.parent = $textarea.closest('.comment').data('comment-id');
    } else {
      actionData.parent = null;
    }

    postComment(actionData, $textarea, commentId, commentsToLoad);
  });

  $('.js-more-comments').on('click', function(e) {
    getComments(offsetCount, commentsToLoad, false);
  })

  function getComments(offset, commentsQty, refresh) {
    $.ajax({
      url: 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments',
      type: 'GET',
      dateType: 'json',
      data: {
          count: commentsQty,
          offset: offset
      },
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        if(data.length) {
          var newCommentsList = '';
          
          $.each(data, function(index, comment) {
            newCommentsList += '<div class="comment" data-author-id="' + comment.author.id + '" data-comment-id="' + comment.id + '">' + 
                                  '<div class="comment_avatar">' +
                                    '<img src="' + comment.author.avatar + '" alt="User Image">' + 
                                  '</div>' + 
                                  '<div class="comment_content">' + 
                                    '<div class="comment_info">' +
                                      '<span class="comment_author">' + comment.author.name + '</span>' +
                                      '<span class="comment_date"><i class="fa fa-clock-o" aria-hidden="true"></i><span class="medium-text"> ' + getDate(comment.updated_at) + '</span> at <span class="medium-text">' + getTime(comment.updated_at) + '</span></span>' +
                                    '</div>' +
                                    '<div class="comment_text js-comment-content">' + comment.content + '</div>' + 
                                    '<div class="comment_actions">';
            
            if(comment.author.id === userId) {
              newCommentsList += '<span class="comment_action js-edit-comment"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</span>' + 
                                 '<span class="comment_action js-delete-comment"><i class="fa fa-times" aria-hidden="true"></i> Delete</span>';
            }
            
            newCommentsList += '<span class="comment_action js-reply-comment"><i class="fa fa-reply" aria-hidden="true"></i> Reply</span>' + 
                              '</div>' +
                              '<div class="comment_typing comment_typing--hidden js-edit-comment-area clearfix">' +
                                '<span class="comment_reply-to"><i class="fa fa-share" aria-hidden="true"></i> ' + comment.author.name + '</span>' + 
                                '<span class="comment_cancel js-cancel-comment"><i class="fa fa-times" aria-hidden="true"></i> Cancel</span>' + 
                                '<textarea class="comment_textarea js-comment-textarea" placeholder="Your Message"></textarea>' +
                                '<input type="button" value="Send" class="comment_submit js-submit-comment">' + 
                              '</div>';
  
            if(comment.children.length) {
              $.each(comment.children, function(index, child) {
                newCommentsList += '<div class="comment-child" data-author-id="' + child.author.id + '" data-comment-id="' + child.id + '">' + 
                                    '<div class="comment-child_avatar">' +
                                      '<img src="' + child.author.avatar + '" alt="User Image">' + 
                                    '</div>' + 
                                    '<div class="comment-child_content">' + 
                                      '<div class="comment-child_info">' +
                                        '<span class="comment-child_author">' + child.author.name + '</span>' +
                                        '<span class="comment-child_parent"><i class="fa fa-share" aria-hidden="true"></i> ' + comment.author.name + '</span>' +
                                        '<span class="comment-child_date"><i class="fa fa-clock-o" aria-hidden="true"></i><span class="medium-text"> ' + getDate(comment.updated_at) + '</span> at <span class="medium-text">' + getTime(comment.updated_at) + '</span></span>' +
                                      '</div>' + 
                                      '<div class="comment-child_text js-comment-content">' + child.content + '</div>';

                if(child.author.id === userId) {
                  newCommentsList += '<div class="comment-child_actions">' + 
                                      '<span class="comment-child_action js-edit-comment"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</span>' + 
                                      '<span class="comment-child_action js-delete-comment"><i class="fa fa-times" aria-hidden="true"></i> Delete</span>' + 
                                     '</div>' + 
                                     '<div class="comment-child_typing comment_typing--hidden js-edit-comment-area clearfix">' +
                                      '<span class="comment-child_reply-to"><i class="fa fa-reply" aria-hidden="true"></i> ' + comment.author.name + '</span>' + 
                                      '<span class="comment-child_cancel js-cancel-comment"><i class="fa fa-times" aria-hidden="true"></i> Cancel</span>' + 
                                      '<textarea class="comment-child_textarea js-comment-textarea" placeholder="Your Message"></textarea>' +
                                      '<input type="button" value="Send" class="comment-child_submit js-submit-comment">' + 
                                     '</div>';
                }


                newCommentsList += '</div>' +
                                  '</div>';
              })
            }
  
            newCommentsList +=  '</div>' + 
                              '</div>';

          });
        }
        
        if(data.length < 5) {
          $('.js-comments-more-block').remove();
        }        

        if(refresh) {
          $('.js-comments-list').empty();
        }
        
        offsetCount += 5;
        $('.js-comments-list').append(newCommentsList);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
      }
    });
  };

  function postComment(actionData, $textarea, commentId, commentsToLoad) {
    var url = 'http://frontend-test.pingbull.com/pages/yurii.rbn@gmail.com/comments'

    if(commentId) url += '/' + commentId;

    $.ajax({
      url: url,
      type: 'POST',
      dateType: 'json',
      data: actionData,
      beforeSend: function() {
        var preloader = '<div class="preload-block">' +
                          '<div class="preloader"></div>' + 
                        '</div>';

        $('.js-comments-list').append(preloader);
      },
      complete: function() {
        $('.js-comments-list').find('.preload-block').remove();
      },
      success: function(data, textStatus, jqXHR) {
        offsetCount = 0;
        $textarea.val('');
        $textarea.parent().attr('data-edit', 0);
        getComments(offsetCount, commentsToLoad, true);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
      }
    });
  };

  function getDate(date) {
    date = new Date(date);
    var day = date.getDate(),
        month = date.getMonth() + 1,
        fullYear = date.getFullYear();

    return fullYear + '-' + '-' + padDate(month) + '-' + padDate(day);
  }

  function getTime(date) {
    date = new Date(date);
    var hours = date.getHours(),
        minutes = date.getMinutes();

    return padDate(hours) + ':' + padDate(minutes);
  }

  function padDate(val) {
    return (val < 10) ? '0' + val : '' + val;
  }
});