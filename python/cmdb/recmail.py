# coding:utf-8

import email
from email.header import decode_header
import os
from cmdb.models.emailmodels import Emailcfg
from imapclient import IMAPClient
import ssl
import json
import datetime
import time
import pyzmail
import imaplib


class MAIL(object):

    def __init__(self):
        em_cfg = Emailcfg.objects.all()[0]
        self.imap_url = em_cfg.imap_url
        self.imap_port = em_cfg.imap_port
        self.imap_ssl = em_cfg.imap_ssl
        self.emailusername = em_cfg.email
        self.empasswd = em_cfg.empasswd
        self.emfolder = em_cfg.emfolder

    def emailLogin(self):
        try:
            if self.imap_ssl == "True":
                context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
                server = IMAPClient(self.imap_url, port=self.imap_port, use_uid=True, ssl=True, ssl_context=context)

            else:
                server = IMAPClient(self.imap_url, port=self.imap_port, use_uid=True, ssl=False)

            server.login(self.emailusername, self.empasswd)
            return server
        except Exception as e:
            return False

    def emailReceive(self, folder, page, size, tag="Seen"):
        imaplib._MAXLINE = 10000000
        server = self.emailLogin()
        if server:
            server.select_folder(folder, readonly=True)
            result = server.search(criteria=tag)
            emails = list()
            total = len(result)
            if total <= size:
                start = 0
                end = 13
            else:
                start = total - page * size
                end = total - (page - 1) * size
            for _sm in result[start:end]:
                data = server.fetch(_sm, ['ENVELOPE'])
                envelope = data[_sm][b'ENVELOPE']
                msgdict = server.fetch(_sm, ['BODY[]'])
                mailbody = msgdict[_sm][b'BODY[]']
                em_date = envelope.date
                msg = pyzmail.PyzMessage.factory(mailbody)
                subject = envelope.subject
                if subject is not None:
                    em_sub = subject.decode()
                    if em_sub[0:2] == "=?":
                        em_sub = msg.get_subject()

                else:
                    em_sub = "none"

                em_from = msg.get_address('from')
                em_type = msg.get_address('Content-Type')
                em_to = msg.get_address('to')
                # print(msg.get_address('cc'))
                # print(msg.get_address('bcc'))

                if msg.html_part != None:
                    text = msg.html_part.get_payload().decode(msg.html_part.charset)
                # elif msg.text_part != None:
                #     print(msg.text_part.charset)
                #     text = msg.text_part.get_payload().decode(msg.html_part.charset)
                else:

                    for part in msg.walk():
                        partname = part.get_filename()
                        if partname != None:
                            print(partname)
                    text = "该邮件中包含附件]，无法接收"
                if em_date is not None:
                    em_date = datetime.datetime.strftime(em_date, '%Y-%m-%d %H:%M:%S')
                else:
                    em_date = ""

                em = {
                    "em_id": _sm,
                    "em_from": em_from,
                    "em_to": em_to,
                    "em_date": em_date,
                    "em_sub": em_sub,
                    "em_context_type": em_type,
                    "em_context": text,
                    "em_folder": folder
                }
                emails.append(em)

            server.logout()
            return {"emails": emails, 'total': total}
            # return ""

        else:
            return "获取邮件失败"

    def emailUnseen(self):
        emails = []
        total = 0
        for f in json.loads(self.emfolder):
            data = self.emailReceive(f, 1, 100, 'unseen')
            emails = emails + data['emails']
            total = total + data['total']

        return {'emails': emails, 'total': total}

    def emailSetSeen(self, mail_id, em_folder):
        server = self.emailLogin()
        server.select_folder(em_folder, readonly=True)
        server.search('unseen')
        msg = server.fetch(mail_id, ['ENVELOPE'])
        server.set_flags(msg, b'\\Seen', silent=False)
        return "success"
